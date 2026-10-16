import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Mic, Volume2, RefreshCw } from 'lucide-react';
import { audioService } from '../utils/audioService';

export interface DiagnosticsViewProps {
  onBack: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ onBack }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [speechRecSupport, setSpeechRecSupport] = useState(false);
  const [mediaRecorderSupport, setMediaRecorderSupport] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('checking...');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  // Live level meter test
  const [isMeterRunning, setIsMeterRunning] = useState(false);
  const [meterLevel, setMeterLevel] = useState(0);
  const meterStreamRef = useRef<MediaStream | null>(null);
  const meterAudioCtxRef = useRef<AudioContext | null>(null);
  const meterAnimRef = useRef<number | null>(null);

  // 5-second test recording state
  const [isRecordingTest, setIsRecordingTest] = useState(false);
  const [testCountdown, setTestCountdown] = useState(5);
  const [testTranscript, setTestTranscript] = useState<string | null>(null);
  const [testProvider, setTestProvider] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Playback tests
  const [playingLang, setPlayingLang] = useState<string | null>(null);

  useEffect(() => {
    // 1. Secure context
    setIsSecure(typeof window !== 'undefined' && window.isSecureContext);

    // 2. SpeechRecognition support
    const hasSpeech =
      typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setSpeechRecSupport(hasSpeech);

    // 3. MediaRecorder support
    const hasRecorder = typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined';
    setMediaRecorderSupport(hasRecorder);

    // 4. Permission query
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((perm) => {
          setPermissionState(perm.state);
          perm.onchange = () => setPermissionState(perm.state);
        })
        .catch(() => setPermissionState('unknown'));
    } else {
      setPermissionState('unknown');
    }

    // 5. Input devices
    refreshDevices();

    return () => {
      stopMeter();
    };
  }, []);

  const refreshDevices = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === 'audioinput');
        setAudioDevices(inputs);
      } catch (err: any) {
        setLastError(`Device enumeration failed: ${err.message}`);
      }
    }
  };

  const startMeter = async () => {
    stopMeter();
    setLastError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      meterStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      meterAudioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setIsMeterRunning(true);

      const loop = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        setMeterLevel(Math.min(1, avg / 128));
        meterAnimRef.current = requestAnimationFrame(loop);
      };
      meterAnimRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      setLastError(`Meter startup failed: ${err.message}`);
      setIsMeterRunning(false);
    }
  };

  const stopMeter = () => {
    if (meterAnimRef.current) cancelAnimationFrame(meterAnimRef.current);
    meterAnimRef.current = null;
    if (meterStreamRef.current) {
      meterStreamRef.current.getTracks().forEach((t) => t.stop());
      meterStreamRef.current = null;
    }
    if (meterAudioCtxRef.current) {
      meterAudioCtxRef.current.close().catch(() => {});
      meterAudioCtxRef.current = null;
    }
    setIsMeterRunning(false);
    setMeterLevel(0);
  };

  // 5-second test recording
  const run5SecondRecordingTest = async () => {
    stopMeter();
    setTestTranscript(null);
    setTestProvider(null);
    setLastError(null);
    setIsRecordingTest(true);
    setTestCountdown(5);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecordingTest(false);
        setIsTranscribing(true);

        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(blob);
          const base64Audio = await base64Promise;

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64Audio,
              mimeType: blob.type,
              language: 'en-IN',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setTestTranscript(data.transcript || '(No speech detected)');
            setTestProvider(data.provider || 'unknown');
          } else {
            setLastError(`Transcribe server error: HTTP ${res.status}`);
          }
        } catch (err: any) {
          setLastError(`Transcription failed: ${err.message}`);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();

      let secondsLeft = 5;
      const interval = setInterval(() => {
        secondsLeft--;
        setTestCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(interval);
          if (recorder.state === 'recording') recorder.stop();
        }
      }, 1000);
    } catch (err: any) {
      setIsRecordingTest(false);
      setLastError(`Could not start 5s recording: ${err.message}`);
    }
  };

  // Playback test for EN, HI, MR
  const playSampleAudio = (lang: 'en' | 'hi' | 'mr') => {
    audioService.unlockAudio();
    audioService.stopAll();
    setPlayingLang(lang);

    const phrases: Record<string, string> = {
      en: 'Welcome friend. This is the BLOOM young girl narration test.',
      hi: 'नमस्ते सहेली। यह ब्लूम बालिका स्वर परीक्षण है।',
      mr: 'नमस्कार मैत्रिणी. हे ब्लूम मुलीच्या आवाजाचे चाचणी ऑडिओ आहे.',
    };

    audioService.playSceneNarration({
      videoId: 'l1',
      sceneIndex: 0,
      language: lang,
      textToSpeak: phrases[lang],
      onStarted: () => setPlayingLang(lang),
      onEnded: () => setPlayingLang(null),
      onError: (err) => {
        setLastError(`Playback failed for ${lang}: ${err}`);
        setPlayingLang(null);
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-in fade-in duration-200">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="text-xs font-bold text-bloom-primary hover:underline flex items-center gap-1 active:scale-95 transition-transform"
      >
        <ArrowLeft size={16} /> Back to BLOOM
      </button>

      <div>
        <h2 className="text-xl font-extrabold text-bloom-ink dark:text-bloom-darkInk">
          Mic & Audio Diagnostics
        </h2>
        <p className="text-xs text-bloom-mute font-medium">
          Comprehensive real-time test of microphone input, speech APIs, and multi-lingual audio playback.
        </p>
      </div>

      {/* System Status Table */}
      <div className="p-4 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bloom-mute">
          1. Environment & API Support
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-bloom-ink dark:text-bloom-darkInk">Secure Context (HTTPS / localhost)</span>
            <span className="flex items-center gap-1 font-bold">
              {isSecure ? (
                <span className="text-bloom-sage flex items-center gap-1">
                  <CheckCircle2 size={14} /> Yes
                </span>
              ) : (
                <span className="text-bloom-terracotta flex items-center gap-1">
                  <XCircle size={14} /> Insecure
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-bloom-ink dark:text-bloom-darkInk">MediaRecorder (Audio capture)</span>
            <span className="flex items-center gap-1 font-bold">
              {mediaRecorderSupport ? (
                <span className="text-bloom-sage flex items-center gap-1">
                  <CheckCircle2 size={14} /> Supported
                </span>
              ) : (
                <span className="text-bloom-terracotta flex items-center gap-1">
                  <XCircle size={14} /> Missing
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-bloom-ink dark:text-bloom-darkInk">SpeechRecognition (Live captions)</span>
            <span className="flex items-center gap-1 font-bold">
              {speechRecSupport ? (
                <span className="text-bloom-sage flex items-center gap-1">
                  <CheckCircle2 size={14} /> Available
                </span>
              ) : (
                <span className="text-bloom-mute flex items-center gap-1">
                  <AlertTriangle size={14} /> Fallback to MediaRecorder
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-bloom-ink dark:text-bloom-darkInk">Microphone Permission State</span>
            <span className="font-bold uppercase text-bloom-primary">
              {permissionState}
            </span>
          </div>
        </div>
      </div>

      {/* Input Devices */}
      <div className="p-4 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-bloom-mute">
            2. Audio Input Devices ({audioDevices.length})
          </h3>
          <button
            onClick={refreshDevices}
            className="text-[11px] text-bloom-primary font-bold flex items-center gap-1 hover:underline"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {audioDevices.length === 0 ? (
          <p className="text-xs text-bloom-mute italic">
            No microphone labels detected yet. Click "Start Live Meter" to prompt permission.
          </p>
        ) : (
          <ul className="text-xs space-y-1">
            {audioDevices.map((d, idx) => (
              <li key={idx} className="font-medium text-bloom-ink flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-bloom-sage" />
                <span>{d.label || `Microphone ${idx + 1}`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Live Level Meter */}
      <div className="p-4 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bloom-mute">
          3. Live Audio Level Meter
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Signal Intensity</span>
            <span>{Math.round(meterLevel * 100)}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-bloom-pressed overflow-hidden">
            <div
              className="h-full bg-bloom-rose transition-all duration-75 rounded-full"
              style={{ width: `${Math.min(100, meterLevel * 100)}%` }}
            />
          </div>

          <div className="pt-1">
            {isMeterRunning ? (
              <button
                onClick={stopMeter}
                className="w-full py-2 rounded-full bg-bloom-rose text-white text-xs font-bold"
              >
                Stop Live Meter
              </button>
            ) : (
              <button
                onClick={startMeter}
                className="w-full py-2 rounded-full bg-bloom-primary text-white text-xs font-bold"
              >
                Start Live Meter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5-Second Test Recording */}
      <div className="p-4 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bloom-mute">
          4. 5-Second Test Recording & Transcription
        </h3>

        {isRecordingTest ? (
          <div className="text-center py-3 space-y-1">
            <div className="text-2xl font-black text-bloom-rose animate-bounce">
              {testCountdown}s
            </div>
            <p className="text-xs font-bold text-bloom-rose">Recording... Speak something now!</p>
          </div>
        ) : isTranscribing ? (
          <div className="text-center py-3 text-xs font-bold text-bloom-gold">
            Sending to /api/transcribe...
          </div>
        ) : (
          <button
            onClick={run5SecondRecordingTest}
            className="w-full py-2 rounded-full bg-bloom-pressed hover:bg-bloom-line border border-bloom-line text-xs font-bold text-bloom-ink"
          >
            Run 5-Second Recording Test
          </button>
        )}

        {testTranscript && (
          <div className="p-3 rounded-[14px] bg-bloom-pressed text-xs space-y-1">
            <div className="font-bold text-bloom-primary">Transcription Result:</div>
            <p className="font-semibold text-bloom-ink italic">"{testTranscript}"</p>
            {testProvider && (
              <span className="text-[10px] text-bloom-mute block">Provider: {testProvider}</span>
            )}
          </div>
        )}
      </div>

      {/* Audio Playback Tests for EN, HI, MR */}
      <div className="p-4 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-bloom-mute">
          5. Multi-Lingual Audio Playback Test (Young-Girl Voice)
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => playSampleAudio('en')}
            disabled={playingLang === 'en'}
            className="py-2.5 px-2 rounded-[14px] bg-bloom-pressed hover:bg-bloom-line text-xs font-bold text-bloom-ink flex flex-col items-center gap-1 border border-bloom-line"
          >
            <Volume2 size={16} className={playingLang === 'en' ? 'animate-pulse text-bloom-primary' : ''} />
            <span>English (en-IN)</span>
          </button>

          <button
            onClick={() => playSampleAudio('hi')}
            disabled={playingLang === 'hi'}
            className="py-2.5 px-2 rounded-[14px] bg-bloom-pressed hover:bg-bloom-line text-xs font-bold text-bloom-ink flex flex-col items-center gap-1 border border-bloom-line"
          >
            <Volume2 size={16} className={playingLang === 'hi' ? 'animate-pulse text-bloom-primary' : ''} />
            <span>Hindi (hi-IN)</span>
          </button>

          <button
            onClick={() => playSampleAudio('mr')}
            disabled={playingLang === 'mr'}
            className="py-2.5 px-2 rounded-[14px] bg-bloom-pressed hover:bg-bloom-line text-xs font-bold text-bloom-ink flex flex-col items-center gap-1 border border-bloom-line"
          >
            <Volume2 size={16} className={playingLang === 'mr' ? 'animate-pulse text-bloom-primary' : ''} />
            <span>Marathi (mr-IN)</span>
          </button>
        </div>

        {playingLang && (
          <div className="text-center text-xs font-bold text-bloom-primary flex items-center justify-center gap-1 pt-1">
            <Volume2 size={14} className="animate-pulse" /> Playing young-girl voice clip ({playingLang.toUpperCase()})...
          </div>
        )}
      </div>

      {/* Last Error Display */}
      {lastError && (
        <div className="p-3 rounded-[16px] bg-bloom-terracotta/15 border border-bloom-terracotta/40 text-xs text-bloom-ink space-y-1">
          <div className="font-bold text-bloom-terracotta flex items-center gap-1">
            <AlertTriangle size={14} /> Last Diagnostics Error
          </div>
          <p className="font-mono text-[11px] text-bloom-ink">{lastError}</p>
        </div>
      )}
    </div>
  );
};
