import { useState, useRef, useCallback, useEffect } from 'react';
import { normalizeSpokenEmail } from '../utils/voiceInput';

export type VoiceInputStatus =
  | 'idle'
  | 'requesting_permission'
  | 'listening'
  | 'processing'
  | 'done'
  | 'error';

export interface VoiceInputError {
  code:
    | 'permission_denied'
    | 'not_found'
    | 'in_app_browser'
    | 'no_speech'
    | 'network'
    | 'unsupported'
    | 'aborted'
    | 'unknown';
  message: string;
  recoverySteps?: string[];
  helpUrl?: string;
}

export interface UseVoiceInputOptions {
  language?: 'en' | 'hi' | 'mr';
  isEmail?: boolean;
  silenceTimeoutMs?: number; // Default 1500ms
  maxDurationMs?: number; // Default 15000ms
  onTranscript?: (transcript: string) => void;
  onError?: (error: VoiceInputError) => void;
}

export function isInsideInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(ua);
}

export function useVoiceInput(initialOptions: UseVoiceInputOptions = {}) {
  const [status, setStatus] = useState<VoiceInputStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0.0 to 1.0
  const [error, setError] = useState<VoiceInputError | null>(null);

  // References to preserve single active session and cleanup
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Timers
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioActivityRef = useRef<number>(Date.now());
  const isComponentMountedRef = useRef<boolean>(true);
  const sessionTokenRef = useRef<number>(0);

  // Keep latest options in ref to avoid stale closures
  const optionsRef = useRef<UseVoiceInputOptions>(initialOptions);
  useEffect(() => {
    optionsRef.current = initialOptions;
  }, [initialOptions]);

  // Clean up all resources
  const stopAllResources = useCallback(() => {
    // 1. Cancel silence & max timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }

    // 2. Cancel animation frame for level meter
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    // 3. Stop SpeechRecognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.abort();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }

    // 4. Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;

    // 5. Stop all MediaStream audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }

    // 6. Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Cleanup on unmount (React StrictMode safe)
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      stopAllResources();
    };
  }, [stopAllResources]);

  // Send recorded audio to /api/transcribe
  const transcribeAudioBlob = useCallback(
    async (audioBlob: Blob, language: string, isEmail: boolean, currentSession: number) => {
      if (currentSession !== sessionTokenRef.current) return;
      if (!isComponentMountedRef.current) return;

      setStatus('processing');

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const res = reader.result as string;
            resolve(res);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(audioBlob);
        const base64Audio = await base64Promise;

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            language,
          }),
        });

        if (currentSession !== sessionTokenRef.current) return;
        if (!isComponentMountedRef.current) return;

        if (!response.ok) {
          throw new Error('Transcription network failure');
        }

        const data = await response.json();
        let finalResult = (data.transcript || '').trim();

        if (isEmail) {
          finalResult = normalizeSpokenEmail(finalResult);
        }

        if (!finalResult) {
          const noSpeechErr: VoiceInputError = {
            code: 'no_speech',
            message:
              language === 'hi'
                ? 'आवाज सुनाई नहीं दी। कृपया माइक दबाकर स्पष्ट बोलें।'
                : language === 'mr'
                ? 'आवाज ऐकू आला नाही. कृपया माइक दाबून स्पष्ट बोला.'
                : 'No speech was detected. Please tap the mic and speak clearly.',
          };
          setError(noSpeechErr);
          setStatus('error');
          optionsRef.current.onError?.(noSpeechErr);
          return;
        }

        setTranscript(finalResult);
        setInterimTranscript('');
        setStatus('done');
        optionsRef.current.onTranscript?.(finalResult);
      } catch (err: any) {
        if (currentSession !== sessionTokenRef.current) return;
        if (!isComponentMountedRef.current) return;

        const networkErr: VoiceInputError = {
          code: 'network',
          message:
            language === 'hi'
              ? 'नेटवर्क समस्या हुई। आप सीधे टाइप कर सकती हैं।'
              : language === 'mr'
              ? 'नेटवर्क अडचण आली. तुम्ही थेट टाईप करू शकता.'
              : 'Network issue transcribing audio. You can type directly instead.',
        };
        setError(networkErr);
        setStatus('error');
        optionsRef.current.onError?.(networkErr);
      }
    },
    []
  );

  // Manual stop command from user click
  const stopListening = useCallback(() => {
    if (status !== 'listening' && status !== 'requesting_permission') {
      stopAllResources();
      setStatus('idle');
      return;
    }

    // If we have MediaRecorder actively recording, stopping it will trigger onstop
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setStatus('processing');
      try {
        mediaRecorderRef.current.stop();
      } catch {
        stopAllResources();
        setStatus('idle');
      }
    } else {
      stopAllResources();
      setStatus(transcript ? 'done' : 'idle');
    }
  }, [status, stopAllResources, transcript]);

  // Main start handler triggered ONLY by direct user click
  const startListening = useCallback(
    async (callOptions: Partial<UseVoiceInputOptions> = {}) => {
      // Abort previous session immediately
      stopAllResources();
      const currentSession = ++sessionTokenRef.current;

      setError(null);
      setTranscript('');
      setInterimTranscript('');
      audioChunksRef.current = [];

      const lang = callOptions.language || optionsRef.current.language || 'en';
      const isEmail = callOptions.isEmail ?? optionsRef.current.isEmail ?? false;
      const silenceTimeoutMs = callOptions.silenceTimeoutMs || optionsRef.current.silenceTimeoutMs || 1500;
      const maxDurationMs = callOptions.maxDurationMs || optionsRef.current.maxDurationMs || 15000;

      const langCode = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

      // 1. Check in-app browsers (Instagram, WhatsApp webviews)
      if (isInsideInAppBrowser()) {
        const inAppErr: VoiceInputError = {
          code: 'in_app_browser',
          message:
            lang === 'hi'
              ? 'इन-ऐप ब्राउज़र में माइक्रोफोन बंद रहता है। कृपया BLOOM को Chrome या Safari में खोलें।'
              : lang === 'mr'
              ? 'इन-अ‍ॅप ब्राऊजरमध्ये मायक्रोफोन बंद असतो. कृपया BLOOM क्रोम किंवा सफारीमध्ये उघडा.'
              : 'In-app browsers (WhatsApp/Instagram) block mic access. Please open BLOOM in Chrome or Safari.',
          recoverySteps: [
            'Tap the three dots (...) or Share icon',
            'Select "Open in Chrome" or "Open in Safari"',
          ],
        };
        setError(inAppErr);
        setStatus('error');
        optionsRef.current.onError?.(inAppErr);
        return;
      }

      // 2. Check getUserMedia support
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        const unsuppErr: VoiceInputError = {
          code: 'unsupported',
          message:
            lang === 'hi'
              ? 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। आप सीधे टाइप कर सकती हैं।'
              : lang === 'mr'
              ? 'या ब्राऊजरमध्ये व्हॉइस इनपुट समर्थित नाही. तुम्ही थेट टाईप करू शकता.'
              : 'Voice recording is not supported in this browser. You can type in the field.',
        };
        setError(unsuppErr);
        setStatus('error');
        optionsRef.current.onError?.(unsuppErr);
        return;
      }

      setStatus('requesting_permission');

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err: any) {
        if (currentSession !== sessionTokenRef.current) return;
        const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
        const isNotFound = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';

        const permErr: VoiceInputError = {
          code: isDenied ? 'permission_denied' : isNotFound ? 'not_found' : 'unknown',
          message: isDenied
            ? lang === 'hi'
              ? 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन चालू करें या टाइप करें।'
              : lang === 'mr'
              ? 'मायक्रोफोनची परवानगी मिळाली नाही. कृपया ब्राऊजर सेटिंग्जमध्ये मायक्रोफोन सुरू करा.'
              : 'Microphone permission was denied. Please allow microphone access or type instead.'
            : isNotFound
            ? 'No microphone found on your device. You can type instead.'
            : 'Could not access microphone. You can type instead.',
          recoverySteps: isDenied
            ? [
                'Look for the lock or camera/mic icon in your address bar',
                'Toggle Microphone to "Allow"',
                'Reload the page and try again',
              ]
            : undefined,
        };
        setError(permErr);
        setStatus('error');
        optionsRef.current.onError?.(permErr);
        return;
      }

      if (currentSession !== sessionTokenRef.current || !isComponentMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;

      // 3. Setup AudioContext and AnalyserNode for live level meter
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioMeter = () => {
            if (
              !isComponentMountedRef.current ||
              currentSession !== sessionTokenRef.current ||
              !analyserRef.current
            ) {
              return;
            }

            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalizedLevel = Math.min(1, avg / 128); // 0.0 to 1.0

            setAudioLevel(normalizedLevel);

            // Silence detection: if sound is above threshold, update activity timestamp
            if (normalizedLevel > 0.08) {
              lastAudioActivityRef.current = Date.now();
            }

            animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
          };

          animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
        }
      } catch {
        // Non-blocking if Web Audio API fails
      }

      // 4. Setup MediaRecorder for reliable audio capture
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Disconnect audio stream tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }

        const combinedBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        // If live SpeechRecognition already produced a good transcript, use it directly!
        if (speechRecognitionRef.current && transcript) {
          setStatus('done');
          optionsRef.current.onTranscript?.(transcript);
        } else {
          // Otherwise, reliably transcribe via /api/transcribe serverless function
          transcribeAudioBlob(combinedBlob, langCode, isEmail, currentSession);
        }
      };

      recorder.start(250); // Emit audio data every 250ms
      setStatus('listening');
      lastAudioActivityRef.current = Date.now();

      // 5. Optional instant path: live captions via SpeechRecognition
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec && !isInsideInAppBrowser()) {
        try {
          const rec = new SpeechRec();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = langCode;

          rec.onresult = (event: any) => {
            if (currentSession !== sessionTokenRef.current) return;
            let interim = '';
            let final = '';

            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                final += res[0].transcript;
              } else {
                interim += res[0].transcript;
              }
            }

            if (final) {
              const cleaned = isEmail ? normalizeSpokenEmail(final) : final.trim();
              setTranscript(cleaned);
              setInterimTranscript('');
            } else if (interim) {
              setInterimTranscript(interim.trim());
            }
            lastAudioActivityRef.current = Date.now();
          };

          rec.onerror = () => {
            // Live captions errored -> MediaRecorder takes over smoothly
          };

          rec.onend = () => {
            // Speech recognition completed
          };

          rec.start();
          speechRecognitionRef.current = rec;
        } catch {
          // Ignore SpeechRecognition startup error, MediaRecorder handles it
        }
      }

      // 6. Silence detection ticker (stops recording after ~1.5s of silence)
      const silenceCheckInterval = setInterval(() => {
        if (currentSession !== sessionTokenRef.current) {
          clearInterval(silenceCheckInterval);
          return;
        }

        const now = Date.now();
        // If recording has run at least 2 seconds and silence persists for silenceTimeoutMs, finish recording
        if (now - lastAudioActivityRef.current > silenceTimeoutMs && recorder.state === 'recording') {
          clearInterval(silenceCheckInterval);
          try {
            recorder.stop();
          } catch {
            // ignore
          }
        }
      }, 300);

      // 7. Maximum duration cap (15 seconds)
      maxDurationTimerRef.current = setTimeout(() => {
        if (currentSession !== sessionTokenRef.current) return;
        if (recorder.state === 'recording') {
          try {
            recorder.stop();
          } catch {
            // ignore
          }
        }
      }, maxDurationMs);
    },
    [stopAllResources, transcribeAudioBlob, transcript]
  );

  const reset = useCallback(() => {
    stopAllResources();
    setStatus('idle');
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setAudioLevel(0);
  }, [stopAllResources]);

  return {
    status,
    transcript,
    interimTranscript,
    audioLevel,
    error,
    isListening: status === 'listening',
    isProcessing: status === 'processing',
    startListening,
    stopListening,
    reset,
  };
}
