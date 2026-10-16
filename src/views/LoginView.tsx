import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Mail, User, ShieldCheck, ArrowRight, UserCheck, HelpCircle } from 'lucide-react';
import { useVoiceInput, VoiceInputError } from '../hooks/useVoiceInput';
import { MicButton } from '../components/MicButton';
import { supabase } from '../utils/supabaseClient';
import { storage } from '../utils/storage';

export interface LoginViewProps {
  onSuccess: () => void;
  onContinueGuest: () => void;
  onOpenDiagnostics?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccess,
  onContinueGuest,
  onOpenDiagnostics,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUnder18, setIsUnder18] = useState(true);
  const [parentalConsent, setParentalConsent] = useState(false);

  // Active voice field being listened to ('name' | 'nickname' | 'email' | null)
  const [activeVoiceField, setActiveVoiceField] = useState<'name' | 'nickname' | 'email' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Single shared useVoiceInput hook instance
  const {
    status,
    audioLevel,
    error: voiceError,
    transcript,
    startListening,
    stopListening,
    reset: resetVoice,
  } = useVoiceInput({
    language: currentLang,
    onTranscript: (capturedText) => {
      if (activeVoiceField === 'name') {
        setName(capturedText);
      } else if (activeVoiceField === 'nickname') {
        setNickname(capturedText);
      } else if (activeVoiceField === 'email') {
        setEmail(capturedText);
      }
      setActiveVoiceField(null);
    },
    onError: (err) => {
      // Voice error is displayed in UI box
    },
  });

  const handleMicClick = (field: 'name' | 'nickname' | 'email') => {
    setErrorMessage(null);

    if (activeVoiceField === field && status === 'listening') {
      stopListening();
      setActiveVoiceField(null);
    } else {
      setActiveVoiceField(field);
      startListening({
        isEmail: field === 'email',
        language: currentLang,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signup' && isUnder18 && !parentalConsent) {
      setErrorMessage('Please confirm parental or guardian awareness under DPDP Act 2023.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (supabase) {
      try {
        if (mode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: nickname || name || 'Friend',
                full_name: name,
                under_18: isUnder18,
                parental_consent: parentalConsent,
              },
            },
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }

        if (parentalConsent) {
          storage.setParentalConsent(true);
        }

        setLoading(false);
        onSuccess();
        return;
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err.message || 'Authentication failed. You can also continue as Guest.');
        return;
      }
    }

    // Offline / Guest simulation if Supabase is not configured
    setTimeout(() => {
      setLoading(false);
      if (parentalConsent) {
        storage.setParentalConsent(true);
      }
      onSuccess();
    }, 500);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 space-y-5 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-bloom-primary text-white flex items-center justify-center shadow-md">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-2xl font-bold text-bloom-ink dark:text-bloom-darkInk">
          {mode === 'signin' ? 'Welcome Back' : 'Join BLOOM'}
        </h2>
        <p className="text-xs text-bloom-mute dark:text-bloom-darkMute font-medium">
          A learning companion that grows with a girl.
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex p-1 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMessage(null);
            resetVoice();
            setActiveVoiceField(null);
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
            mode === 'signin'
              ? 'bg-bloom-primary text-white shadow-sm'
              : 'text-bloom-mute dark:text-bloom-darkMute'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
            resetVoice();
            setActiveVoiceField(null);
          }}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
            mode === 'signup'
              ? 'bg-bloom-primary text-white shadow-sm'
              : 'text-bloom-mute dark:text-bloom-darkMute'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Live Voice Status Feedback */}
      {status === 'listening' && activeVoiceField && (
        <div className="p-3 rounded-[16px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-rose/40 text-xs text-bloom-ink dark:text-bloom-darkInk space-y-1 animate-pulse">
          <div className="flex items-center justify-between font-bold">
            <span>
              Listening for {activeVoiceField === 'email' ? 'email' : activeVoiceField}...
            </span>
            <button
              type="button"
              onClick={stopListening}
              className="px-2.5 py-1 rounded-full bg-bloom-rose text-white text-[11px] font-bold"
            >
              Done
            </button>
          </div>
          <p className="text-[11px] text-bloom-mute dark:text-bloom-darkMute">
            {activeVoiceField === 'email'
              ? 'Speak clearly, e.g. "priya at the rate gmail dot com"'
              : 'Speak clearly into your microphone'}
          </p>
        </div>
      )}

      {/* Voice Error Notification with Diagnostic Link */}
      {voiceError && (
        <div className="p-3 rounded-[16px] bg-bloom-terracotta/15 border border-bloom-terracotta/30 text-xs text-bloom-ink dark:text-bloom-darkInk space-y-1.5">
          <div className="font-bold text-bloom-terracotta">{voiceError.message}</div>
          {voiceError.recoverySteps && (
            <ul className="list-disc list-inside text-[11px] text-bloom-mute space-y-0.5">
              {voiceError.recoverySteps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
          <div className="pt-1">
            <span className="text-[11px] text-bloom-mute">You can always type directly.</span>
          </div>
        </div>
      )}

      {/* Authentication Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-[16px] bg-bloom-rose/15 border border-bloom-rose/30 text-xs text-bloom-rose font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            {/* Name Field with Voice Input */}
            <div>
              <label className="block text-xs font-bold text-bloom-mute dark:text-bloom-darkMute mb-1">
                Full Name (Voice enabled)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-bloom-mute pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-14 py-3 rounded-[16px] bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine text-sm font-medium focus:outline-none focus:border-bloom-primary"
                />
                <div className="absolute right-1.5">
                  <MicButton
                    size="sm"
                    label="Voice input for Name"
                    status={activeVoiceField === 'name' ? status : 'idle'}
                    audioLevel={activeVoiceField === 'name' ? audioLevel : 0}
                    onClick={() => handleMicClick('name')}
                  />
                </div>
              </div>
            </div>

            {/* Nickname Field with Voice Input */}
            <div>
              <label className="block text-xs font-bold text-bloom-mute dark:text-bloom-darkMute mb-1">
                Nickname / Preferred Name (Voice enabled)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-bloom-mute pointer-events-none">
                  <UserCheck size={16} />
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Piku"
                  className="w-full pl-10 pr-14 py-3 rounded-[16px] bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine text-sm font-medium focus:outline-none focus:border-bloom-primary"
                />
                <div className="absolute right-1.5">
                  <MicButton
                    size="sm"
                    label="Voice input for Nickname"
                    status={activeVoiceField === 'nickname' ? status : 'idle'}
                    audioLevel={activeVoiceField === 'nickname' ? audioLevel : 0}
                    onClick={() => handleMicClick('nickname')}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Email Field with Voice Input */}
        <div>
          <label className="block text-xs font-bold text-bloom-mute dark:text-bloom-darkMute mb-1">
            Email Address (Voice enabled)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-bloom-mute pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. friend@example.com"
              className="w-full pl-10 pr-14 py-3 rounded-[16px] bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine text-sm font-medium focus:outline-none focus:border-bloom-primary"
            />
            <div className="absolute right-1.5">
              <MicButton
                size="sm"
                label="Voice input for Email"
                status={activeVoiceField === 'email' ? status : 'idle'}
                audioLevel={activeVoiceField === 'email' ? audioLevel : 0}
                onClick={() => handleMicClick('email')}
              />
            </div>
          </div>
          <span className="block text-[11px] text-bloom-mute dark:text-bloom-darkMute mt-1">
            You can speak "at the rate" and "dot"
          </span>
        </div>

        {/* Password Field: Strictly Typed Only (Never Voice-Entered) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-bloom-mute dark:text-bloom-darkMute">
              Password (Typed only)
            </label>
            <span className="text-[10px] font-semibold text-bloom-rose">
              No mic for security
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-bloom-mute pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine text-sm font-medium focus:outline-none focus:border-bloom-primary"
            />
          </div>
          <p className="text-[11px] text-bloom-mute dark:text-bloom-darkMute mt-1">
            For your security and privacy, passwords must always be typed manually.
          </p>
        </div>

        {/* Parental Consent Checkbox (DPDP Act 2023) */}
        {mode === 'signup' && (
          <div className="p-3 rounded-[16px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/60 dark:border-bloom-darkLine space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-bloom-ink dark:text-bloom-darkInk">
              <input
                type="checkbox"
                checked={parentalConsent}
                onChange={(e) => setParentalConsent(e.target.checked)}
                className="mt-0.5 rounded border-bloom-line text-bloom-primary focus:ring-bloom-primary"
              />
              <span className="font-medium leading-relaxed">
                My parent or guardian is aware and gives consent (India DPDP Act 2023).
              </span>
            </label>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-clay active:scale-95 transition-transform"
        >
          {loading ? (
            <span>Please wait...</span>
          ) : (
            <>
              <span>{mode === 'signin' ? 'Sign In to BLOOM' : 'Create My Account'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Guest Option */}
        <button
          type="button"
          onClick={onContinueGuest}
          className="w-full py-2.5 rounded-[18px] text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-ink dark:hover:text-bloom-darkInk transition-colors"
        >
          Continue as Guest (No account needed)
        </button>
      </form>
    </div>
  );
};
