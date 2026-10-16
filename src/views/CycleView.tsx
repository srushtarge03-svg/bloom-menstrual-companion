import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CycleAnalysis, CycleRecord, parseISODate, daysBetween, formatISODate } from '../utils/cycleMath';
import { storage } from '../utils/storage';
import { CycleForm, CycleFormData } from '../components/CycleForm';
import { CycleRing } from '../components/CycleRing';
import { PhaseCard } from '../components/PhaseCard';
import { BloomChat } from '../components/BloomChat';

export interface CycleViewProps {
  analysis?: CycleAnalysis | null;
  onOpenLogModal?: () => void;
  onOpenDiagnostics?: () => void;
  onSaveCycle?: (record: CycleRecord) => Promise<void> | void;
}

export const CycleView: React.FC<CycleViewProps> = ({
  analysis,
  onOpenLogModal,
  onOpenDiagnostics,
  onSaveCycle,
}) => {
  const { t } = useTranslation();

  // Reference for scrolling to the form when prompted
  const formRef = useRef<HTMLDivElement | null>(null);

  // Fallback state if analysis is not yet loaded
  const [internalStartDate, setInternalStartDate] = useState<string>(() => {
    if (analysis?.latestRecord?.start) return analysis.latestRecord.start;
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return formatISODate(d);
  });
  const [internalEndDate, setInternalEndDate] = useState<string>(
    analysis?.latestRecord?.end || ''
  );
  const [internalCramps, setInternalCramps] = useState<number>(
    typeof analysis?.latestRecord?.cramps === 'number' ? analysis.latestRecord.cramps : 0
  );
  const [internalFlow, setInternalFlow] = useState<number>(
    typeof analysis?.latestRecord?.flow === 'number' ? analysis.latestRecord.flow : 1
  );
  const [internalCycleLength, setInternalCycleLength] = useState<number>(
    analysis?.averageCycleLength || 28
  );

  // Sync state from analysis prop
  useEffect(() => {
    if (analysis) {
      if (analysis.latestRecord?.start) {
        setInternalStartDate(analysis.latestRecord.start);
      }
      setInternalEndDate(analysis.latestRecord?.end || '');
      if (typeof analysis.latestRecord?.cramps === 'number') {
        setInternalCramps(analysis.latestRecord.cramps);
      }
      if (typeof analysis.latestRecord?.flow === 'number') {
        setInternalFlow(analysis.latestRecord.flow);
      }
      if (analysis.averageCycleLength) {
        setInternalCycleLength(analysis.averageCycleLength);
      }
    }
  }, [analysis]);

  // Compute live cycle day based on internalStartDate and today
  const computeCycleDay = (startStr: string): number => {
    try {
      const today = new Date();
      const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startDate = parseISODate(startStr);
      return Math.max(1, daysBetween(todayNormalized, startDate) + 1);
    } catch {
      return 1;
    }
  };

  const currentDay = analysis ? analysis.currentDayOfCycle : computeCycleDay(internalStartDate);
  const cycleLength = analysis?.averageCycleLength || internalCycleLength || 28;

  // Compute current phase
  const computePhase = (day: number, len: number): number => {
    const periodLen = Math.max(3, Math.min(7, Math.round(len * (5 / 28))));
    const ovDay = Math.max(periodLen + 2, len - 14);
    if (day <= periodLen) return 0;
    if (day < ovDay - 1) return 1;
    if (day <= ovDay + 1) return 2;
    return 3;
  };

  const currentPhase = analysis ? analysis.currentPhase : computePhase(currentDay, cycleLength);

  // Selected phase for PhaseCard explorer (defaults to current phase)
  const [selectedPhase, setSelectedPhase] = useState<number>(currentPhase);

  // Keep selectedPhase synced with currentPhase when phase changes
  useEffect(() => {
    setSelectedPhase(currentPhase);
  }, [currentPhase]);

  // Period duration calculation
  const periodDuration = internalEndDate && internalEndDate >= internalStartDate
    ? daysBetween(parseISODate(internalEndDate), parseISODate(internalStartDate)) + 1
    : 5;

  // Handle saving period data from CycleForm
  const handleFormSave = async (formData: CycleFormData) => {
    const newRecord: CycleRecord = {
      start: formData.startDate,
      end: formData.endDate,
      cramps: formData.cramps,
      flow: formData.flow,
      mood: 1,
    };

    setInternalStartDate(formData.startDate);
    setInternalEndDate(formData.endDate || '');
    setInternalCramps(formData.cramps);
    setInternalFlow(formData.flow);
    setInternalCycleLength(formData.cycleLength);

    if (onSaveCycle) {
      await onSaveCycle(newRecord);
    } else {
      await storage.saveCycle(newRecord);
    }

    const nextDay = computeCycleDay(formData.startDate);
    const nextPhase = computePhase(nextDay, formData.cycleLength);
    setSelectedPhase(nextPhase);
  };

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Section 3 Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-bloom-ink dark:text-bloom-darkInk">
          {t('cycle.title') || 'Cycle Tracker & Bloom AI'}
        </h2>
        <p className="text-xs sm:text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
          {t('cycle.subtitle') || 'Understand your natural rhythm and get instant, caring wellness answers'}
        </p>
      </div>

      {/* =========================================
          LAYOUT 1. INPUT FORM (Top of Section)
          ========================================= */}
      <div ref={formRef}>
        <CycleForm
          initialData={{
            startDate: internalStartDate,
            endDate: internalEndDate,
            cramps: internalCramps,
            flow: internalFlow,
            cycleLength: cycleLength,
          }}
          onSave={handleFormSave}
        />
      </div>

      {/* =========================================
          LAYOUT 2. CYCLE CIRCLE (SVG clock ring)
          ========================================= */}
      <div className="clay-card p-5 sm:p-6 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine flex flex-col items-center">
        <CycleRing
          currentDay={currentDay}
          cycleLength={cycleLength}
          selectedPhase={selectedPhase}
          onSelectPhase={(idx) => setSelectedPhase(idx)}
          onPromptNewPeriod={handleScrollToForm}
        />
      </div>

      {/* =========================================
          LAYOUT 3. PHASE INFORMATION CARD
          ========================================= */}
      <PhaseCard
        selectedPhase={selectedPhase}
        currentPhase={currentPhase}
        currentDay={currentDay}
        crampsLevel={internalCramps}
        flowLevel={internalFlow}
        periodDurationDays={periodDuration}
      />

      {/* =========================================
          LAYOUT 4. BLOOM AI ASSISTANT CHAT
          ========================================= */}
      <BloomChat
        currentPhase={currentPhase}
        currentDay={currentDay}
        crampsLevel={internalCramps}
        flowLevel={internalFlow}
        avgCycleLength={cycleLength}
      />

      {/* Guest Privacy & Compliance Footer */}
      <p className="text-[11px] text-center text-bloom-mute dark:text-bloom-darkMute font-medium px-4">
        {t('cycle.guestNotice') || 'All cycle data is stored privately on your device. DPDP Act 2023 compliant.'}
      </p>
    </div>
  );
};
