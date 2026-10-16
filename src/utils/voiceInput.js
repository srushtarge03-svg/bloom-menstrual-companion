/**
 * Spoken Voice Recognition & Normalization Utilities
 * JavaScript module for Node and browser runtime.
 */

export function normalizeSpokenEmail(rawSpeech) {
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

export class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening(options) {
    if (!this.isSupported()) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();

    const langCode = options.language === 'hi' ? 'hi-IN' : options.language === 'mr' ? 'mr-IN' : 'en-IN';
    this.recognition.lang = langCode;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      options.onListeningStart?.();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const finalVal = options.isEmail ? normalizeSpokenEmail(transcript) : transcript;
      options.onResult(finalVal);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      options.onError?.(event.error || 'Failed to capture speech');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onListeningEnd?.();
    };

    try {
      this.recognition.start();
    } catch (e) {
      options.onError?.('Unable to start speech input');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
