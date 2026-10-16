import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Sparkles, Volume2, Bot, User, AlertCircle, HeartHandshake } from 'lucide-react';
import { audioService } from '../utils/audioService';
import { useVoiceInput, VoiceInputError } from '../hooks/useVoiceInput';

export interface BloomChatMessage {
  id: string;
  sender: 'user' | 'bloom';
  text: string;
  time: string;
}

export interface BloomChatProps {
  currentPhase: number;     // 0: Menstrual, 1: Follicular, 2: Ovulation, 3: Luteal
  currentDay: number;
  crampsLevel: number;      // 0: None, 1: Mild, 2: Moderate, 3: Severe
  flowLevel: number;        // 0: Low, 1: Medium, 2: High
  avgCycleLength: number;
}

export const BloomChat: React.FC<BloomChatProps> = ({
  currentPhase,
  currentDay,
  crampsLevel,
  flowLevel,
  avgCycleLength,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const phaseNames = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal'];
  const activePhaseName = phaseNames[currentPhase] || 'Menstrual';

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initialGreeting =
    currentLang === 'hi'
      ? `नमस्ते सहेली! मैं ब्लूम हूँ। आप चक्र के दिन ${currentDay} (${activePhaseName} चरण) पर हैं। अपने शरीर, ऐंठन या मूड के बारे में मुझसे कोई भी सवाल पूछ सकती हैं!`
      : currentLang === 'mr'
      ? `नमस्कार मैत्रिणी! मी ब्लूम आहे. तुम्ही चक्राच्या दिवस ${currentDay} (${activePhaseName} टप्पा) वर आहात. पोटदुखी, मनस्थिती किंवा शरीरातील बदलांविषयी मला काहीही विचारा!`
      : `Hi friend! I'm Bloom, your big-sister wellness companion. You are on Day ${currentDay} (${activePhaseName} Phase). Feel free to ask me anything about your cycle, cramps, mood, or body changes!`;

  const [messages, setMessages] = useState<BloomChatMessage[]>([
    {
      id: 'initial',
      sender: 'bloom',
      text: initialGreeting,
      time: formatCurrentTime(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Shared voice input hook (Step 2)
  const {
    status: voiceStatus,
    error: voiceError,
    startListening,
    stopListening,
    reset: resetVoice,
  } = useVoiceInput({
    language: currentLang,
    onTranscript: (capturedText) => {
      setInputText(capturedText);
    },
    onError: (err) => {
      setMicError(err.message);
    },
  });

  const isListening = voiceStatus === 'listening';

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Quick suggestion chips
  const suggestionChips = [
    { label: 'Cramps', query: 'What helps soothe menstrual cramps?' },
    { label: 'Mood swings', query: 'Why do I experience mood swings before my period?' },
    { label: 'Fatigue', query: 'Why do I feel tired during this phase?' },
    { label: 'Bloating', query: 'How can I gently manage tummy bloating?' },
  ];

  const handleChipClick = (query: string) => {
    setInputText(query);
  };

  // Microphone Handler using shared useVoiceInput hook
  const toggleListening = () => {
    setMicError(null);
    if (isListening) {
      stopListening();
    } else {
      startListening({
        language: currentLang,
        isEmail: false,
      });
    }
  };

  // Send message using real Gemini AI endpoint on local server (Step 3)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || isThinking) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    const userMsg: BloomChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      time: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    setMicError(null);

    try {
      const payload = {
        phase: currentPhase,
        cycleDay: currentDay,
        avgCycleLength,
        crampsLevel,
        flowLevel,
        transcript: query,
        prompt: query,
        language: currentLang,
        history: messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      };

      const response = await fetch('/api/bloom-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.reply) {
        throw new Error(data.error || 'Empty response received from Bloom AI.');
      }

      const reply = data.reply;
      const botMsg: BloomChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bloom',
        text: reply,
        time: formatCurrentTime(),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakMessage(reply);
    } catch (err: any) {
      // Clear, honest error notice. NEVER show canned/fake replies.
      const errorNotice = `⚠️ Bloom AI is currently unavailable:\n\n${err.message || 'Unable to connect to local server.'}\n\nPlease verify:\n1. The local server is running (launch with START_BLOOM.bat or run 'node server.js').\n2. Your Google Gemini API key is pasted in the .env file (GEMINI_API_KEY=...).`;

      const botMsg: BloomChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bloom',
        text: errorNotice,
        time: formatCurrentTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const speakMessage = (text: string) => {
    audioService.unlockAudio();
    audioService.speakViaWebSpeech(text, currentLang);
  };

  return (
    <div className="clay-card p-4 sm:p-5 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-3.5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-bloom-line/60 dark:border-bloom-darkLine">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-bloom-primary/15 text-bloom-primary dark:text-bloom-darkPrimary flex items-center justify-center font-bold shadow-sm">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-bloom-ink dark:text-bloom-darkInk">
                Bloom Assistant
              </h3>
              <span className="w-2 h-2 rounded-full bg-bloom-sage animate-pulse" />
            </div>
            <p className="text-[11px] text-bloom-mute dark:text-bloom-darkMute font-medium">
              Private, caring guidance tailored to Day {currentDay}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-bloom-primary dark:text-bloom-darkPrimary bg-bloom-pressed dark:bg-bloom-darkPressed px-2.5 py-1 rounded-full border border-bloom-line/60 dark:border-bloom-darkLine">
          <HeartHandshake size={13} />
          <span>Big Sister AI</span>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-bloom-mute flex-shrink-0 flex items-center gap-1 mr-1">
          <Sparkles size={12} className="text-bloom-gold" />
          <span>Ask:</span>
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip.query)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed hover:bg-bloom-primary/10 text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/70 dark:border-bloom-darkLine transition-all active:scale-95 font-medium"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Box */}
      <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-2 rounded-[16px] bg-bloom-surface dark:bg-bloom-darkSurface border border-bloom-line/60 dark:border-bloom-darkLine">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-bloom-primary text-white'
                    : 'bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-primary border border-bloom-line/70'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`max-w-[80%] rounded-[18px] p-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-bloom-primary text-white shadow-sm rounded-tr-sm'
                    : 'bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/70 dark:border-bloom-darkLine shadow-clay-pill rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] opacity-70">
                  <span>{m.time}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => speakMessage(m.text)}
                      className="hover:opacity-100 p-0.5 active:scale-95"
                      title="Hear Bloom read aloud"
                      aria-label="Hear Bloom read aloud"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isThinking && (
          <div className="flex items-start gap-2 animate-in fade-in">
            <div className="w-7 h-7 rounded-full bg-bloom-pressed text-bloom-primary flex items-center justify-center text-xs">
              <Bot size={14} />
            </div>
            <div className="bg-bloom-card dark:bg-bloom-darkCard border border-bloom-line/70 p-3 rounded-[18px] rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-bloom-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-bloom-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-bloom-primary animate-bounce" />
              <span className="text-[11px] font-medium text-bloom-mute ml-1">Bloom is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic Error Notice */}
      {micError && (
        <div className="p-2.5 rounded-[12px] bg-bloom-rose/15 border border-bloom-rose/30 text-[11px] text-bloom-ink dark:text-bloom-darkInk flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={14} className="text-bloom-rose flex-shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Listening State Banner */}
      {isListening && (
        <div className="p-2 rounded-full bg-bloom-rose/15 border border-bloom-rose/40 text-xs font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center justify-center gap-2 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-bloom-rose" />
          <span>Listening to your voice... Speak now</span>
        </div>
      )}

      {/* Input Bar Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Voice Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Speak with microphone'}
          title={isListening ? 'Stop listening' : 'Tap to speak'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 border ${
            isListening
              ? 'bg-bloom-rose text-white border-bloom-rose shadow-lg animate-pulse'
              : 'bg-bloom-surface dark:bg-bloom-darkSurface text-bloom-primary dark:text-bloom-darkPrimary border-bloom-line dark:border-bloom-darkLine hover:bg-bloom-pressed'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type or speak a question for Bloom...'}
          className="flex-1 h-11 px-4 text-xs sm:text-sm font-medium rounded-full bg-bloom-surface dark:bg-bloom-darkSurface text-bloom-ink dark:text-bloom-darkInk border border-bloom-line dark:border-bloom-darkLine focus:outline-none focus:ring-2 focus:ring-bloom-primary/50 shadow-clay-pressed"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          aria-label="Send message to Bloom"
          className="w-11 h-11 rounded-full btn-primary text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-clay"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
