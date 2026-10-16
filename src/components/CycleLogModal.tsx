import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Check } from 'lucide-react';
import { CycleRecord, formatISODate } from '../utils/cycleMath';

export interface CycleLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CycleRecord) => void;
  initialRecord?: CycleRecord | null;
  initialDate?: string;
}

export const CycleLogModal: React.FC<CycleLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  initialDate,
}) => {
  const { t } = useTranslation();
  const todayStr = formatISODate(new Date());

  // Controlled component states
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<number>(0); // 0: Light, 1: Medium, 2: Heavy
  const [cramps, setCramps] = useState<number>(0); // 0: None, 1: Mild, 2: Medium, 3: Severe
  const [mood, setMood] = useState<number>(1); // 0: Happy, 1: Okay, 2: Tired, 3: Moody, 4: Sad
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);

  // Synchronize state whenever modal opens or when editing an existing entry
  useEffect(() => {
    if (isOpen) {
      if (initialRecord) {
        setStartDate(initialRecord.start || todayStr);
        setEndDate(initialRecord.end || '');
        setFlow(typeof initialRecord.flow === 'number' ? initialRecord.flow : 0);
        setCramps(typeof initialRecord.cramps === 'number' ? initialRecord.cramps : 0);
        setMood(typeof initialRecord.mood === 'number' ? initialRecord.mood : 1);
        setSelectedSymptoms(Array.isArray(initialRecord.symptoms) ? [...initialRecord.symptoms] : []);
      } else {
        setStartDate(initialDate || todayStr);
        setEndDate('');
        setFlow(0); // Defaults cleanly to Light
        setCramps(0);
        setMood(1);
        setSelectedSymptoms([]);
      }
    }
  }, [isOpen, initialRecord, initialDate, todayStr]);

  if (!isOpen) return null;

  const flowLabels = (t('cycle.flows', { returnObjects: true }) as string[]) || ['Light', 'Medium', 'Heavy'];
  const crampsLabels = (t('cycle.cramps', { returnObjects: true }) as string[]) || ['None', 'Mild', 'Medium', 'Severe'];
  const moodLabels = (t('cycle.moods', { returnObjects: true }) as string[]) || ['Happy', 'Okay', 'Tired', 'Moody', 'Sad'];
  const symptomLabels = (t('cycle.symptoms', { returnObjects: true }) as string[]) || [
    'Headache',
    'Backache',
    'Pimples',
    'Bloating',
    'Fatigue',
    'Cravings',
  ];

  const toggleSymptom = (index: number) => {
    if (selectedSymptoms.includes(index)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== index));
    } else {
      setSelectedSymptoms([...selectedSymptoms, index]);
    }
  };

  const handleSave = () => {
    if (!startDate) return;

    onSave({
      id: initialRecord?.id,
      start: startDate,
      end: endDate || undefined,
      flow,
      cramps,
      mood,
      symptoms: selectedSymptoms,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-bloom-card dark:bg-bloom-darkCard rounded-t-[24px] sm:rounded-[24px] p-5 sm:p-6 shadow-clay dark:shadow-clay-dark border border-bloom-line/80 dark:border-bloom-darkLine max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-bloom-line/70 dark:border-bloom-darkLine">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-primary dark:text-bloom-darkPrimary flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-bloom-ink dark:text-bloom-darkInk">
              {initialRecord ? 'Edit Period Entry' : t('cycle.logModalTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-mute flex items-center justify-center hover:text-bloom-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.startDate')} *
            </label>
            <input
              type="date"
              max={todayStr}
              value={startDate}
              data-testid="start-date-input"
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine font-medium text-sm focus:outline-none focus:border-bloom-primary"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.endDate')}
            </label>
            <input
              type="date"
              min={startDate}
              max={todayStr}
              value={endDate}
              data-testid="end-date-input"
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 rounded-[16px] bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine font-medium text-sm focus:outline-none focus:border-bloom-primary"
            />
          </div>

          {/* Flow Selector (Fully Controlled Component) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.flowLabel')}
            </label>
            <div className="flex flex-wrap gap-2" data-testid="flow-selector">
              {flowLabels.map((label, idx) => {
                const isSelected = flow === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`flow-option-${idx}`}
                    onClick={() => setFlow(idx)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-bloom-primary text-white shadow-sm'
                        : 'bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine hover:border-bloom-primary'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cramps Selector (Controlled Component) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.crampsLabel')}
            </label>
            <div className="flex flex-wrap gap-2" data-testid="cramps-selector">
              {crampsLabels.map((label, idx) => {
                const isSelected = cramps === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`cramps-option-${idx}`}
                    onClick={() => setCramps(idx)}
                    className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-bloom-terracotta text-white shadow-sm'
                        : 'bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine hover:border-bloom-terracotta'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Selector (Controlled Component) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.moodLabel')}
            </label>
            <div className="flex flex-wrap gap-2" data-testid="mood-selector">
              {moodLabels.map((label, idx) => {
                const isSelected = mood === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`mood-option-${idx}`}
                    onClick={() => setMood(idx)}
                    className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-bloom-gold text-bloom-ink dark:text-bloom-darkBg shadow-sm font-bold'
                        : 'bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine hover:border-bloom-gold'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Multi-Selector (Controlled Component) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute mb-1.5">
              {t('cycle.symptomsLabel')}
            </label>
            <div className="flex flex-wrap gap-2" data-testid="symptoms-selector">
              {symptomLabels.map((label, idx) => {
                const isSelected = selectedSymptoms.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`symptom-option-${idx}`}
                    onClick={() => toggleSymptom(idx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-bloom-teal text-white shadow-sm font-bold'
                        : 'bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/80 dark:border-bloom-darkLine'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-bold text-xs sm:text-sm text-bloom-mute bg-bloom-pressed dark:bg-bloom-darkPressed hover:bg-bloom-line/60 transition-all"
          >
            {t('cycle.cancel')}
          </button>
          <button
            type="button"
            data-testid="save-cycle-btn"
            disabled={!startDate}
            onClick={handleSave}
            className="flex-1 py-3 rounded-full font-bold text-xs sm:text-sm text-white btn-primary shadow-clay transition-all disabled:opacity-50"
          >
            {t('cycle.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
