import React from 'react';
import { Mic, MicOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { VoiceInputStatus } from '../hooks/useVoiceInput';

export interface MicButtonProps {
  status: VoiceInputStatus;
  audioLevel?: number; // 0.0 to 1.0
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  status,
  audioLevel = 0,
  size = 'md',
  label = 'Voice Input',
  disabled = false,
  onClick,
  className = '',
}) => {
  const isListening = status === 'listening';
  const isRequesting = status === 'requesting_permission';
  const isProcessing = status === 'processing';
  const isDone = status === 'done';
  const isError = status === 'error';

  // Size dimensions and icon sizes (minimum 44px touch target)
  const sizeClasses = {
    sm: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-full',
    md: 'w-14 h-14 min-w-[48px] min-h-[48px] rounded-full',
    lg: 'w-20 h-20 min-w-[72px] min-h-[72px] rounded-full shadow-clay active:scale-95',
  }[size];

  const iconSize = {
    sm: 18,
    md: 22,
    lg: 32,
  }[size];

  // Animated pulse scale calculated from audio level (0 to 1)
  const ringScale = isListening ? 1 + audioLevel * 0.45 : 1;
  const ringOpacity = isListening ? 0.3 + audioLevel * 0.6 : 0;

  // Background styling matching mature clay palette
  let bgStyle = 'bg-bloom-primary text-white hover:bg-bloom-primary/95';
  if (isListening) {
    bgStyle = 'bg-bloom-rose text-white ring-4 ring-bloom-rose/40 animate-pulse';
  } else if (isProcessing) {
    bgStyle = 'bg-bloom-gold text-bloom-ink';
  } else if (isDone) {
    bgStyle = 'bg-bloom-sage text-white';
  } else if (isError) {
    bgStyle = 'bg-bloom-terracotta text-white';
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Live Audio Level Meter Ring */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full bg-bloom-rose pointer-events-none transition-transform duration-75"
          style={{
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Accessible Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isProcessing || isRequesting}
        aria-label={`${label}: ${status}`}
        aria-pressed={isListening}
        aria-live="polite"
        className={`relative z-10 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${bgStyle} ${className}`}
      >
        {isRequesting ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isProcessing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isDone ? (
          <Check size={iconSize} strokeWidth={2.5} />
        ) : isError ? (
          <AlertCircle size={iconSize} strokeWidth={2.2} />
        ) : isListening ? (
          <Mic size={iconSize} strokeWidth={2.4} />
        ) : (
          <Mic size={iconSize} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
};
