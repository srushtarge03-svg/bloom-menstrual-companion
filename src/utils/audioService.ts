/**
 * BLOOM Narration Audio Service
 * 
 * Manages audio playback for animated educational videos, TTS fallback,
 * browser audio unlocking, and multi-lingual young-girl voice prosody.
 */

export interface AudioPlayOptions {
  videoId: string;
  sceneIndex: number;
  language: string; // 'en' | 'hi' | 'mr'
  textToSpeak: string;
  onStarted?: () => void;
  onEnded: () => void;
  onError?: (err: any) => void;
  onAutoplayBlocked?: () => void;
}

class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;
  private isSpeakingSpeech = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-unlock audio engine on first user interaction
      const unlockHandler = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
        window.removeEventListener('click', unlockHandler);
      };
      window.addEventListener('pointerdown', unlockHandler, { once: true, passive: true });
      window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
      window.addEventListener('click', unlockHandler, { once: true, passive: true });

      // Cache speech voices on voiceschanged
      if ('speechSynthesis' in window) {
        this.cachedVoices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedVoices = window.speechSynthesis.getVoices();
        };
      }
    }
  }

  /**
   * Browser Audio Unlock: Resumes AudioContext and plays silent buffer
   */
  public unlockAudio(): void {
    if (this.isUnlocked || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }

        // Play silent 1-sample buffer to unlock iOS Safari and Chrome audio stack
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      }
      this.isUnlocked = true;
    } catch {
      // Non-blocking
    }
  }

  public stopAll(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeakingSpeech = false;
  }

  public pause(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
  }

  public resume(): void {
    this.unlockAudio();
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Plays MP3 scene narration file with automatic fallback handling
   */
  public playSceneNarration({
    videoId,
    sceneIndex,
    language,
    textToSpeak,
    onStarted,
    onEnded,
    onError,
    onAutoplayBlocked,
  }: AudioPlayOptions): void {
    this.stopAll();
    this.unlockAudio();

    // 1. Try local pre-generated MP3 file: /audio/{videoId}/{sceneIndex}.{language}.mp3
    const mp3Path = `/audio/${videoId}/${sceneIndex}.${language}.mp3`;

    let hasFallenBack = false;
    const fallbackToSpeech = () => {
      if (hasFallenBack) return;
      hasFallenBack = true;
      this.currentAudio = null;
      this.speakViaWebSpeech(textToSpeak, language, onStarted, onEnded);
    };

    // Fast check if audio file exists without hanging on HTML 404
    fetch(mp3Path, { method: 'HEAD' })
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && !ct.includes('text/html') && (ct.includes('audio') || ct.includes('octet-stream'))) {
          const audio = new Audio(mp3Path);
          audio.preload = 'auto';

          audio.onplay = () => {
            onStarted && onStarted();
          };

          audio.onended = () => {
            this.currentAudio = null;
            onEnded();
          };

          audio.onerror = () => {
            fallbackToSpeech();
          };

          this.currentAudio = audio;

          audio.play().catch((err: any) => {
            if (err.name === 'NotAllowedError') {
              if (onAutoplayBlocked) {
                onAutoplayBlocked();
              } else {
                fallbackToSpeech();
              }
            } else {
              fallbackToSpeech();
            }
          });
        } else {
          // Immediately use young girl Web Speech if MP3 is absent
          fallbackToSpeech();
        }
      })
      .catch(() => {
        fallbackToSpeech();
      });
  }

  /**
   * Young-Girl Speech Synthesis (8-10 years old tone)
   * Pitch: 1.4 (+40% authentic child pitch shift)
   * Rate: 0.92 (gentle, expressive child cadence)
   * Female Indian voices with Marathi -> Hindi female fallback and strict male exclusion.
   */
  public speakViaWebSpeech(
    text: string,
    language: string,
    onStarted?: () => void,
    onEnded?: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTimeout(() => {
        onEnded && onEnded();
      }, 5000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Resume synthesis to overcome Chrome's paused queue bug
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Gentle, clear Indian child cadence
      utterance.pitch = 1.12; // Sweet, youthful young-girl pitch without formant clipping/distortion

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };
      const targetLang = langMap[language] || 'en-IN';
      utterance.lang = targetLang;

      // Select female voice with Indian accent
      const voices =
        this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      const matchedVoice = this.pickBestFemaleVoice(voices, targetLang, language);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        // CRITICAL: Ensure utterance.lang matches the voice's declared language
        // so Chromium uses the correct phonetic synthesis model
        utterance.lang = matchedVoice.lang;
      }

      utterance.onstart = () => {
        this.isSpeakingSpeech = true;
        onStarted && onStarted();
      };

      utterance.onend = () => {
        this.isSpeakingSpeech = false;
        onEnded && onEnded();
      };

      utterance.onerror = () => {
        this.isSpeakingSpeech = false;
        onEnded && onEnded();
      };

      this.isSpeakingSpeech = true;
      window.speechSynthesis.speak(utterance);
      // Ensure Chrome doesn't stall after speak()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      setTimeout(() => {
        onEnded && onEnded();
      }, 5000);
    }
  }

  private pickBestFemaleVoice(
    voices: SpeechSynthesisVoice[],
    targetLang: string,
    language: string
  ): SpeechSynthesisVoice | null {
    if (!voices || voices.length === 0) return null;

    // Male voices to strictly EXCLUDE (never allow adult male voice)
    const EXPLICIT_MALE_NAMES = [
      'male', 'david', 'mark', 'george', 'hemant', 'ravi', 'richard', 'james',
      'rishi', 'guy', 'stefan', 'manoj', 'fred', 'alex', 'daniel', 'oliver',
      'madhur', 'prabhat', 'ajay', 'arun', 'neel', 'deepak', 'karan', 'rohit',
      'anil', 'suresh', 'amit', 'vijay', 'raj', 'rahul', 'sanjay', 'vikram',
      'kunal', 'tarun', 'alok', 'dev', 'harsh', 'mohit', 'paul', 'tom',
      'john', 'mike', 'peter', 'brian', 'steve', 'kevin', 'eric', 'desktop'
    ];

    const isExplicitMale = (name: string) => {
      const lower = (name || '').toLowerCase();
      return EXPLICIT_MALE_NAMES.some((m) => lower.includes(m));
    };

    // Female names across platforms (Windows, Android, Apple, Google)
    const isExplicitFemale = (v: SpeechSynthesisVoice) => {
      if (isExplicitMale(v.name)) return false;
      const lower = (v.name || '').toLowerCase();
      return (
        lower.includes('female') ||
        lower.includes('girl') ||
        lower.includes('woman') ||
        lower.includes('हिन्दी') ||   // Google हिन्दी (Chrome built-in female Hindi)
        lower.includes('मराठी') ||   // Google मराठी (Chrome built-in female Marathi)
        lower.includes('kalpana') || // Microsoft Kalpana (Hindi female)
        lower.includes('heera') ||   // Microsoft Heera (English-India female)
        lower.includes('swara') ||   // Microsoft Swara (Hindi female)
        lower.includes('aarohi') ||  // Microsoft Aarohi (Marathi female)
        lower.includes('neerja') ||  // Microsoft Neerja (English-India female)
        lower.includes('kavya') ||
        lower.includes('veena') ||
        lower.includes('lekha') ||   // Apple Lekha (Hindi female)
        lower.includes('ananya') ||  // Apple Ananya (Indian English female)
        lower.includes('sangeeta') ||
        lower.includes('priya') ||
        lower.includes('aditi') ||
        lower.includes('shruti') ||
        lower.includes('zira') ||    // Microsoft Zira
        lower.includes('jenny') ||   // Microsoft Jenny
        lower.includes('aria') ||    // Microsoft Aria
        lower.includes('samantha') ||// Apple Samantha
        lower.includes('victoria') ||
        lower.includes('karen') ||
        lower.includes('tessa') ||
        lower.includes('moira')
      );
    };

    // 1. Direct lang match + explicit female name
    const directFemale = voices.find(
      (v) => (v.lang === targetLang || v.lang.replace('_', '-') === targetLang) && isExplicitFemale(v)
    );
    if (directFemale) return directFemale;

    // 2. Direct lang match + non-male voice
    const directNonMale = voices.find(
      (v) => (v.lang === targetLang || v.lang.replace('_', '-') === targetLang) && !isExplicitMale(v.name)
    );
    if (directNonMale) return directNonMale;

    // 3. Marathi fallback: if no Marathi voice on system, use Hindi female voice (Google हिन्दी, Swara, Kalpana)
    if (language === 'mr' || targetLang.startsWith('mr')) {
      const hindiFemale = voices.find(
        (v) => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && isExplicitFemale(v)
      );
      if (hindiFemale) return hindiFemale;

      const hindiNonMale = voices.find((v) => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && !isExplicitMale(v.name));
      if (hindiNonMale) return hindiNonMale;
    }

    // 4. English India ('en-IN') female voice
    const enIndianFemale = voices.find(
      (v) => (v.lang === 'en-IN' || v.lang === 'en_IN') && isExplicitFemale(v)
    );
    if (enIndianFemale) return enIndianFemale;

    // 5. Any explicit female voice on the device
    const anyFemale = voices.find((v) => isExplicitFemale(v));
    if (anyFemale) return anyFemale;

    // 6. Any non-male voice
    const anyNonMale = voices.find((v) => !isExplicitMale(v.name));
    if (anyNonMale) return anyNonMale;

    return null;
  }
}

export const audioService = new AudioService();
