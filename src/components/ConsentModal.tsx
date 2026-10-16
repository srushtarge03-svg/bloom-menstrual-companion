import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart } from 'lucide-react';
import { storage } from '../utils/storage';

export interface ConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onConsent }) => {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleAgree = () => {
    storage.setParentalConsent(true);
    onConsent();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-bloom-card dark:bg-bloom-darkCard rounded-[22px] p-6 shadow-clay dark:shadow-clay-dark border border-bloom-line/80 dark:border-bloom-darkLine space-y-4">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-primary dark:text-bloom-darkPrimary flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck size={26} />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-bloom-ink dark:text-bloom-darkInk">
            {t('privacy.consentHeading')}
          </h3>
          <p className="text-xs text-bloom-mute dark:text-bloom-darkMute font-medium">
            India DPDP Act 2023 Compliant
          </p>
        </div>

        {/* Content Box */}
        <div className="p-4 rounded-[18px] bg-bloom-bg dark:bg-bloom-darkBg text-xs sm:text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium border border-bloom-line/70 dark:border-bloom-darkLine">
          {t('privacy.consentText')}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute">
          <span className="flex items-center gap-1">
            <Heart size={14} className="text-bloom-rose" /> No Ads
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-bloom-teal" /> Zero Tracking
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-bloom-primary dark:text-bloom-darkPrimary" /> Local First
          </span>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 p-3 rounded-[16px] bg-bloom-pressed dark:bg-bloom-darkPressed cursor-pointer border border-bloom-line/70 dark:border-bloom-darkLine">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-bloom-primary focus:ring-bloom-primary"
          />
          <span className="text-xs font-medium text-bloom-ink dark:text-bloom-darkInk leading-snug">
            {t('privacy.consentConfirmed')}
          </span>
        </label>

        {/* Submit */}
        <button
          onClick={handleAgree}
          disabled={!isChecked}
          className="w-full py-3.5 rounded-full font-bold text-white btn-primary shadow-clay transition-all disabled:opacity-40"
        >
          {t('auth.continueGuest')}
        </button>
      </div>
    </div>
  );
};
