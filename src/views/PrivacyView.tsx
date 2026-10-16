import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Trash2, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import { storage } from '../utils/storage';

export interface PrivacyViewProps {
  onBack: () => void;
  onDataDeleted: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack, onDataDeleted }) => {
  const { t } = useTranslation();
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const handleDeleteData = async () => {
    const confirmDelete = window.confirm(t('privacy.deleteConfirm'));
    if (!confirmDelete) return;

    await storage.deleteAllData();
    setDeletedSuccess(true);
    setTimeout(() => {
      onDataDeleted();
    }, 1500);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start text-sm font-semibold text-bloom-primary dark:text-bloom-darkPrimary hover:underline flex items-center gap-1 active:scale-95 transition-transform"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-bloom-ink dark:text-bloom-darkInk">
          {t('privacy.title')}
        </h2>
        <p className="text-xs sm:text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
          {t('privacy.subtitle')}
        </p>
      </div>

      {/* DPDP Compliance Card */}
      <div className="clay-card p-5 sm:p-6 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-3.5">
        <div className="flex items-center gap-2.5 text-bloom-teal dark:text-bloom-darkTeal font-bold text-sm sm:text-base">
          <ShieldCheck size={22} />
          <span>{t('privacy.consentHeading')}</span>
        </div>

        <p className="text-xs sm:text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
          {t('privacy.consentText')}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute">
          <div className="p-2.5 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg flex items-center gap-1.5">
            <Heart size={14} className="text-bloom-rose" /> Zero Tracking
          </div>
          <div className="p-2.5 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-bloom-primary dark:text-bloom-darkPrimary" /> No Ads Ever
          </div>
          <div className="p-2.5 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-bloom-teal dark:text-bloom-darkTeal" /> No Data Selling
          </div>
          <div className="p-2.5 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-bloom-gold" /> Local Device Only
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="clay-card p-5 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
          {t('privacy.accountMode')}
        </span>
        <p className="text-sm font-bold text-bloom-ink dark:text-bloom-darkInk">
          {t('privacy.guestMode')}
        </p>
      </div>

      {/* Delete All My Data (DPDP Right to Erasure) */}
      <div className="clay-card p-5 sm:p-6 rounded-[20px] bg-bloom-rose/10 dark:bg-bloom-rose/15 border border-bloom-rose/30 shadow-clay dark:shadow-clay-dark space-y-3">
        <div className="flex items-center gap-2 text-bloom-rose font-bold text-sm sm:text-base">
          <Trash2 size={20} />
          <span>{t('privacy.deleteDataHeading')}</span>
        </div>

        <p className="text-xs text-bloom-ink/80 dark:text-bloom-darkInk/80 leading-relaxed font-medium">
          {t('privacy.deleteDataDesc')}
        </p>

        {deletedSuccess ? (
          <div className="p-3 rounded-full bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage flex items-center justify-center gap-2 text-xs font-bold">
            <CheckCircle2 size={16} />
            <span>{t('privacy.dataDeleted')}</span>
          </div>
        ) : (
          <button
            onClick={handleDeleteData}
            className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-bloom-rose hover:bg-bloom-rose/90 active:scale-98 shadow-sm transition-all"
          >
            {t('privacy.deleteButton')}
          </button>
        )}
      </div>

      {/* Medical Disclaimer & Footer */}
      <div className="p-4 rounded-[18px] bg-bloom-pressed dark:bg-bloom-darkPressed text-center space-y-2 border border-bloom-line/60 dark:border-bloom-darkLine">
        <p className="text-xs text-bloom-mute dark:text-bloom-darkMute font-bold">
          {t('app.footerNote')}
        </p>
        <p className="text-[11px] text-bloom-mute/80 dark:text-bloom-darkMute/80 font-medium leading-relaxed">
          {t('app.medicalDisclaimer')}
        </p>
      </div>
    </div>
  );
};
