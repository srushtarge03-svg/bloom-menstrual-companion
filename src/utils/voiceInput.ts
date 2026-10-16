/**
 * Spoken Voice Recognition & Normalization Utilities
 * Supports en-IN, hi-IN, mr-IN speech recognition.
 * Normalizes spoken patterns for email addresses safely on-device.
 */

export function normalizeSpokenEmail(rawSpeech: string): string {
  if (!rawSpeech) return '';

  let normalized = rawSpeech.toLowerCase().trim();

  // Multi-lingual email keyword normalizations
  // "at the rate of", "at the rate", "at rate", "एट द रेट" -> "@"
  normalized = normalized
    .replace(/\bat the rate of\b/gi, '@')
    .replace(/\bat the rate\b/gi, '@')
    .replace(/\bat rate\b/gi, '@')
    .replace(/एट द रेट/gi, '@')
    .replace(/एट/gi, '@');

  // English " at " when used as email separator
  normalized = normalized.replace(/\s+at\s+/gi, '@');

  // "dot", "डॉट", "point", "पॉइंट" -> "."
  normalized = normalized
    .replace(/\bdot\b/gi, '.')
    .replace(/डॉट/gi, '.')
    .replace(/\bpoint\b/gi, '.')
    .replace(/पॉइंट/gi, '.');

  // "underscore", "अंडरस्कोर" -> "_"
  normalized = normalized
    .replace(/\bunderscore\b/gi, '_')
    .replace(/अंडरस्कोर/gi, '_');

  // "hyphen", "dash", "डैश" -> "-"
  normalized = normalized
    .replace(/\bhyphen\b/gi, '-')
    .replace(/\bdash\b/gi, '-')
    .replace(/डैश/gi, '-');

  // Remove all spaces inside email
  normalized = normalized.replace(/\s+/g, '');

  return normalized.toLowerCase();
}

export interface VoiceRecognitionOptions {
  language: string; // 'en' | 'hi' | 'mr'
  isEmail?: boolean;
  onListeningStart?: () => void;
  onResult: (transcript: string) => void;
  onError?: (errorMessage: string) => void;
  onListeningEnd?: () => void;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening = false;

  public startListening(options: VoiceRecognitionOptions): void {
    if (typeof window === 'undefined') {
      options.onError && options.onError('Speech recognition not available on this platform.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      options.onError &&
        options.onError(
          'Your browser does not support voice input. You can type directly in the field.'
        );
      return;
    }

    try {
      this.stop();

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };
      this.recognition.lang = langMap[options.language] || 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        options.onListeningStart && options.onListeningStart();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const processed = options.isEmail ? normalizeSpokenEmail(transcript) : transcript.trim();
        options.onResult(processed);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let msg = 'Voice input stopped. You can type in the field.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission was denied. Please allow microphone access or type instead.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech was heard. Please tap the microphone and speak clearly.';
        }
        options.onError && options.onError(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onListeningEnd && options.onListeningEnd();
      };

      this.recognition.start();
    } catch (err) {
      options.onError &&
        options.onError('Could not start microphone. Please type directly into the field.');
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();
