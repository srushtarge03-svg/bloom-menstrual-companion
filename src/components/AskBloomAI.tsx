import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Square, RotateCcw, Volume2, ShieldCheck, HeartHandshake, Check, AlertCircle } from 'lucide-react';
import { CycleAnalysis } from '../utils/cycleMath';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { MicButton } from './MicButton';
import { audioService } from '../utils/audioService';
import { PHASES_CONTENT } from '../data/phasesContent';

export interface AskBloomAIProps {
  analysis?: CycleAnalysis | null;
  onOpenDiagnostics?: () => void;
}

interface MessageTurn {
  role: 'user' | 'assistant';
  content: string;
}

export const AskBloomAI: React.FC<AskBloomAIProps> = ({ analysis, onOpenDiagnostics }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const [aiState, setAiState] = useState<'idle' | 'confirming' | 'thinking' | 'speaking'>('idle');
  const [confirmedTranscript, setConfirmedTranscript] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<MessageTurn[]>([]);

  // Unified voice input hook
  const {
    status: micStatus,
    audioLevel,
    transcript: liveTranscript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    reset: resetVoice,
  } = useVoiceInput({
    language: currentLang,
    onTranscript: (captured) => {
      if (captured && captured.trim()) {
        setConfirmedTranscript(captured.trim());
        setAiState('confirming');
        setStatusMessage(null);
      }
    },
    onError: (err) => {
      setAiState('idle');
      setStatusMessage(err.message);
    },
  });

  const handleMicTap = () => {
    audioService.stopAll();
    setAiReply(null);
    setIsEmergency(false);
    setStatusMessage(null);

    if (micStatus === 'listening') {
      stopListening();
    } else {
      setConfirmedTranscript('');
      setAiState('idle');
      startListening({ language: currentLang });
    }
  };

  const handleRetry = () => {
    resetVoice();
    setConfirmedTranscript('');
    setAiState('idle');
    startListening({ language: currentLang });
  };

  const handleStopSpeaking = () => {
    audioService.stopAll();
    setAiState('idle');
  };

  // Confirm transcript and send to serverless API
  const handleConfirmAndSend = async () => {
    const textToSend = confirmedTranscript || liveTranscript;
    if (!textToSend.trim()) return;

    setAiState('thinking');
    setStatusMessage(
      currentLang === 'hi'
        ? 'Bloom AI सोच रही है...'
        : currentLang === 'mr'
        ? 'Bloom AI विचार करत आहे...'
        : 'Bloom AI is thinking...'
    );

    try {
      const payload = {
        phase: analysis ? analysis.currentPhase : 0,
        cycleDay: analysis ? analysis.currentDayOfCycle : 1,
        avgCycleLength: analysis ? analysis.averageCycleLength : 28,
        recentSymptoms: analysis?.latestRecord?.symptoms?.map(
          (sIdx) => ['Headache', 'Backache', 'Pimples', 'Bloating', 'Fatigue', 'Cravings'][sIdx]
        ) || [],
        language: currentLang,
        transcript: textToSend,
        history,
      };

      const response = await fetch('/api/bloom-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let replyText = '';
      let isEmerg = false;

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          replyText = data.reply;
          isEmerg = Boolean(data.isEmergency);
        } else {
          replyText = getRuleBasedFallback(textToSend);
        }
      } else {
        replyText = getRuleBasedFallback(textToSend);
      }

      setAiReply(replyText);
      setIsEmergency(isEmerg);
      setStatusMessage(null);

      // Append to history
      setHistory((prev) => [
        ...prev.slice(-3),
        { role: 'user', content: textToSend },
        { role: 'assistant', content: replyText },
      ]);

      // Speak aloud in young-girl voice
      setAiState('speaking');
      audioService.speakViaWebSpeech(
        replyText,
        currentLang,
        () => setAiState('speaking'),
        () => setAiState('idle')
      );
    } catch {
      const fallback = getRuleBasedFallback(textToSend);
      setAiReply(fallback);
      setAiState('speaking');
      setStatusMessage(null);
      audioService.speakViaWebSpeech(
        fallback,
        currentLang,
        () => setAiState('speaking'),
        () => setAiState('idle')
      );
    }
  };

  // Rule-based fallback using phases content
  const getRuleBasedFallback = (q: string): string => {
    const currentPhaseKey = analysis ? `p${analysis.currentPhase}` : 'p0';
    const phaseData = PHASES_CONTENT[currentPhaseKey] || PHASES_CONTENT.p0;

    const lower = q.toLowerCase();
    if (lower.includes('cramp') || lower.includes('pain') || lower.includes('ऐंठन') || lower.includes('पोटदुखी')) {
      return currentLang === 'hi'
        ? 'माहवारी में हल्की ऐंठन स्वाभाविक है। पेट पर गर्म पानी की थैली रखकर आराम करें और गुनगुना पानी पिएं। यदि दर्द अधिक हो तो किसी बड़े या डॉक्टर को बताएं।'
        : currentLang === 'mr'
        ? 'पाळीदरम्यान हलकी पोटदुखी सामान्य असते. पोटावर गरम पाण्याची पिशवी ठेवा आणि कोमट पाणी प्या. जास्त त्रास असल्यास मोठ्यांशी बोला.'
        : 'Mild cramps are very common as uterine muscles work. Try resting with a warm water bottle on your lower tummy and sipping warm water. If pain is severe, speak with a trusted adult or doctor.';
    }

    if (lower.includes('tired') || lower.includes('sleep') || lower.includes('थकान') || lower.includes('थकवा')) {
      return currentLang === 'hi'
        ? 'इस चरण में शरीर को अधिक ऊर्जा की ज़रूरत होती है। 8-9 घंटे की अच्छी नींद लें और पौष्टिक भोजन करें।'
        : currentLang === 'mr'
        ? 'या टप्प्यात शरीराला जास्त ऊर्जेची गरज असते. ८-९ तास शांत झोपा आणि पौष्टिक आहार घ्या.'
        : 'Your body works hard during this phase. Getting 8 to 9 hours of sleep and eating warm nourishing food will restore your natural energy.';
    }

    const tips = phaseData.todaySuggestions[currentLang] || phaseData.todaySuggestions.en;
    return tips[0] || 'Take gentle care of yourself today. Remember you are growing beautifully and naturally.';
  };

  return (
    <div className="clay-card p-5 sm:p-6 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bloom-primary/15 text-bloom-primary dark:text-bloom-darkPrimary flex items-center justify-center">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base text-bloom-ink dark:text-bloom-darkInk">
              {t('cycle.askBloomAI.title')}
            </h3>
            <p className="text-xs text-bloom-mute dark:text-bloom-darkMute">
              {t('cycle.askBloomAI.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Voice-First Central Action Button */}
      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <MicButton
          size="lg"
          status={micStatus}
          audioLevel={audioLevel}
          label="Ask Bloom AI"
          onClick={handleMicTap}
        />

        {/* Live Audio Level Meter Indicator */}
        {micStatus === 'listening' ? (
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-bold text-bloom-rose animate-pulse">
              {currentLang === 'hi'
                ? 'सुन रहे हैं... अपना सवाल पूछें'
                : currentLang === 'mr'
                ? 'ऐकत आहोत... आपला प्रश्न विचारा'
                : 'Listening... Speak your question now'}
            </span>
            <div className="w-32 h-1.5 rounded-full bg-bloom-pressed overflow-hidden">
              <div
                className="h-full bg-bloom-rose transition-all duration-75 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, audioLevel * 100))}%` }}
              />
            </div>
            {interimTranscript && (
              <p className="text-xs italic text-bloom-mute pt-1 text-center max-w-[280px]">
                "{interimTranscript}"
              </p>
            )}
          </div>
        ) : aiState === 'thinking' ? (
          <span className="text-xs font-bold text-bloom-gold animate-pulse">
            {statusMessage || 'Thinking...'}
          </span>
        ) : aiState === 'speaking' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-bloom-primary flex items-center gap-1">
              <Volume2 size={16} className="animate-pulse" /> Speaking...
            </span>
            <button
              onClick={handleStopSpeaking}
              className="px-3 py-1 rounded-full bg-bloom-pressed hover:bg-bloom-line text-xs font-bold text-bloom-ink flex items-center gap-1 transition-colors"
            >
              <Square size={12} fill="currentColor" /> Stop
            </button>
          </div>
        ) : (
          <span className="text-xs font-medium text-bloom-mute text-center">
            {currentLang === 'hi'
              ? 'पूछने के लिए माइक बटन दबाएं'
              : currentLang === 'mr'
              ? 'विचारण्यासाठी माइक बटण दाबा'
              : 'Tap microphone to speak your question'}
          </span>
        )}
      </div>

      {/* Voice Error Notice with Diagnostic Link */}
      {voiceError && (
        <div className="p-3 rounded-[16px] bg-bloom-terracotta/15 border border-bloom-terracotta/30 text-xs text-bloom-ink dark:text-bloom-darkInk space-y-1.5">
          <div className="font-bold text-bloom-terracotta flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>{voiceError.message}</span>
          </div>
          {voiceError.recoverySteps && (
            <ul className="list-disc list-inside text-[11px] text-bloom-mute space-y-0.5">
              {voiceError.recoverySteps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-bloom-mute">Mic having issues?</span>
            <a
              href="/diagnostics"
              onClick={(e) => {
                if (onOpenDiagnostics) {
                  e.preventDefault();
                  onOpenDiagnostics();
                }
              }}
              className="text-[11px] font-bold text-bloom-primary underline"
            >
              Run Mic Diagnostics
            </a>
          </div>
        </div>
      )}

      {/* Transcript Confirmation Step (Confirm & Ask or Retry) */}
      {aiState === 'confirming' && (confirmedTranscript || liveTranscript) && (
        <div className="p-3.5 rounded-[18px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine space-y-2.5 animate-in fade-in duration-150">
          <div className="text-[11px] font-bold text-bloom-primary dark:text-bloom-darkPrimary uppercase tracking-wider">
            {currentLang === 'hi' ? 'पहचाना गया सवाल' : currentLang === 'mr' ? 'ओळखलेला प्रश्न' : 'Heard your question'}
          </div>
          <p className="text-sm font-semibold text-bloom-ink dark:text-bloom-darkInk italic">
            "{confirmedTranscript || liveTranscript}"
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConfirmAndSend}
              className="flex-1 py-2 px-3 rounded-full bg-bloom-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Check size={14} />
              <span>{currentLang === 'hi' ? 'पुष्टि करें और पूछें' : currentLang === 'mr' ? 'खात्री करा आणि विचारा' : 'Confirm & Ask'}</span>
            </button>
            <button
              onClick={handleRetry}
              className="py-2 px-3 rounded-full bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw size={14} />
              <span>{currentLang === 'hi' ? 'दोबारा बोलें' : currentLang === 'mr' ? 'पुन्हा बोला' : 'Retry'}</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Reply Card */}
      {aiReply && (
        <div className={`p-4 rounded-[18px] space-y-2 border transition-all ${
          isEmergency
            ? 'bg-bloom-terracotta/15 border-bloom-terracotta/40 text-bloom-ink'
            : 'bg-bloom-pressed dark:bg-bloom-darkPressed border-bloom-line/70 text-bloom-ink dark:text-bloom-darkInk'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-bloom-primary" />
              <span className="text-xs font-bold text-bloom-primary dark:text-bloom-darkPrimary">
                Bloom AI
              </span>
            </div>
            {aiState === 'speaking' && (
              <button
                onClick={handleStopSpeaking}
                className="text-[11px] font-semibold text-bloom-rose flex items-center gap-1 hover:underline"
              >
                <Square size={10} fill="currentColor" /> Stop voice
              </button>
            )}
          </div>

          <p className="text-sm leading-relaxed font-medium">
            {aiReply}
          </p>

          {isEmergency && (
            <div className="mt-2 pt-2 border-t border-bloom-terracotta/30 flex items-center gap-2 text-xs font-bold text-bloom-terracotta">
              <ShieldCheck size={16} />
              <span>Childline India: 1098 (24x7 Free Helpline)</span>
            </div>
          )}
        </div>
      )}

      {/* Safety Notice & Childline 1098 */}
      <div className="pt-2 border-t border-bloom-line/50 dark:border-bloom-darkLine text-center space-y-1">
        <p className="text-[10px] text-bloom-mute dark:text-bloom-darkMute leading-tight">
          Educational guidance only, not medical diagnosis. For emergencies, consult a doctor or call Childline India 1098.
        </p>
      </div>
    </div>
  );
};
