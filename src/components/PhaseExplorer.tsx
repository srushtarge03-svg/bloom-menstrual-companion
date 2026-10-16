import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Sprout, Sun, Moon, Sparkles, Heart, Apple, Bed, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { PHASES_CONTENT, PhaseInfo } from '../data/phasesContent';

export interface PhaseExplorerProps {
  currentPhaseIndex: number; // 0, 1, 2, 3
  currentCycleDay: number;
}

export const PhaseExplorer: React.FC<PhaseExplorerProps> = ({
  currentPhaseIndex,
  currentCycleDay,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const phaseKeys = ['p0', 'p1', 'p2', 'p3'];
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<string>(
    phaseKeys[currentPhaseIndex] || 'p0'
  );

  // Sync selected phase when currentPhaseIndex changes
  useEffect(() => {
    setSelectedPhaseKey(phaseKeys[currentPhaseIndex] || 'p0');
  }, [currentPhaseIndex]);

  const activePhase: PhaseInfo = PHASES_CONTENT[selectedPhaseKey] || PHASES_CONTENT.p0;
  const isOngoingPhase = phaseKeys[currentPhaseIndex] === selectedPhaseKey;

  const phaseIcons: Record<string, React.FC<{ size: number }>> = {
    p0: Droplet,
    p1: Sprout,
    p2: Sun,
    p3: Moon,
  };

  const ActiveIcon = phaseIcons[selectedPhaseKey] || Droplet;

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Header with Medical Review Notice */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-bloom-ink dark:text-bloom-darkInk">
            Cycle Phases Explorer
          </h3>
          <p className="text-xs text-bloom-mute dark:text-bloom-darkMute font-medium">
            Understand the 4 natural rhythms of your body
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bloom-gold/20 text-bloom-ink dark:text-bloom-darkInk">
          Needs Medical Review
        </span>
      </div>

      {/* Swipeable / Tabbed Phase Switcher */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-[18px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine">
        {phaseKeys.map((k, idx) => {
          const ph = PHASES_CONTENT[k];
          const isSelected = selectedPhaseKey === k;
          const isOngoing = currentPhaseIndex === idx;
          const IconComponent = phaseIcons[k];

          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedPhaseKey(k)}
              className={`py-2 px-1 rounded-[14px] flex flex-col items-center gap-1 transition-all relative ${
                isSelected
                  ? 'bg-bloom-card dark:bg-bloom-darkCard text-bloom-primary dark:text-bloom-darkPrimary shadow-sm border border-bloom-line/60 dark:border-bloom-darkLine font-bold'
                  : 'text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-ink font-medium'
              }`}
            >
              {isOngoing && (
                <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-bloom-primary dark:bg-bloom-darkPrimary" />
              )}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: ph.color }}
              >
                <IconComponent size={14} />
              </div>
              <span className="text-[10px] leading-tight text-center line-clamp-1">
                {ph.daysLabel[currentLang].split(' ')[0]} {idx + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail Card */}
      <div className="clay-card p-5 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-4">
        {/* Phase Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: activePhase.color }}
            >
              <ActiveIcon size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-bloom-ink dark:text-bloom-darkInk leading-tight">
                {activePhase.name[currentLang]}
              </h4>
              <span className="text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute">
                {activePhase.daysLabel[currentLang]}
              </span>
            </div>
          </div>

          {isOngoingPhase && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-bloom-primary text-white shadow-sm">
              Today: Day {currentCycleDay}
            </span>
          )}
        </div>

        {/* Personalized "Today: you may feel..." Suggestions (if ongoing phase) */}
        {isOngoingPhase && (
          <div className="p-4 rounded-[18px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-primary/25 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-bloom-primary dark:text-bloom-darkPrimary">
              <Sparkles size={16} />
              <span>Today: Personalized Self-Care Tips</span>
            </div>
            <ul className="space-y-1.5 text-xs text-bloom-ink/90 dark:text-bloom-darkInk/90 font-medium">
              {activePhase.todaySuggestions[currentLang].map((sug, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-bloom-primary font-bold mt-0.5">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What Happens in the Body */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
            What is happening in your body
          </h5>
          <p className="text-xs sm:text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
            {activePhase.whatHappens[currentLang]}
          </p>
        </div>

        {/* Common Symptoms Grid */}
        <div className="space-y-2 pt-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
            Common symptoms you might notice
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-[14px] bg-bloom-bg dark:bg-bloom-darkBg border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
              <span className="font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center gap-1.5">
                <Activity size={14} className="text-bloom-terracotta" /> Physical
              </span>
              <ul className="text-bloom-mute dark:text-bloom-darkMute space-y-0.5">
                {activePhase.symptoms.physical[currentLang].map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-[14px] bg-bloom-bg dark:bg-bloom-darkBg border border-bloom-line/60 dark:border-bloom-darkLine space-y-1">
              <span className="font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center gap-1.5">
                <Heart size={14} className="text-bloom-rose" /> Emotional
              </span>
              <ul className="text-bloom-mute dark:text-bloom-darkMute space-y-0.5">
                {activePhase.symptoms.emotional[currentLang].map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* What To Do Self-Care Tips */}
        <div className="space-y-2 pt-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
            What to do for your body and mind
          </h5>
          <div className="space-y-1.5 text-xs text-bloom-ink/90 dark:text-bloom-darkInk/90">
            <div className="flex items-start gap-2">
              <Apple size={15} className="text-bloom-sage flex-shrink-0 mt-0.5" />
              <span><b>Food:</b> {activePhase.tips.food[currentLang]}</span>
            </div>
            <div className="flex items-start gap-2">
              <Bed size={15} className="text-bloom-teal flex-shrink-0 mt-0.5" />
              <span><b>Sleep:</b> {activePhase.tips.sleep[currentLang]}</span>
            </div>
            <div className="flex items-start gap-2">
              <Activity size={15} className="text-bloom-gold flex-shrink-0 mt-0.5" />
              <span><b>Movement:</b> {activePhase.tips.movement[currentLang]}</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck size={15} className="text-bloom-primary flex-shrink-0 mt-0.5" />
              <span><b>Hygiene:</b> {activePhase.tips.hygiene[currentLang]}</span>
            </div>
          </div>
        </div>

        {/* When to talk to a trusted adult or doctor */}
        <div className="p-3 rounded-[16px] bg-bloom-gold/15 dark:bg-bloom-darkGold/15 border border-bloom-gold/30 flex items-start gap-2.5 text-xs text-bloom-ink dark:text-bloom-darkInk">
          <AlertCircle size={16} className="text-bloom-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">When to talk to a trusted adult or doctor</span>
            <p className="leading-relaxed font-medium">
              {activePhase.whenToTalk[currentLang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
