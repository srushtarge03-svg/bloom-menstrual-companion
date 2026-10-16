import React, { useState, useEffect } from 'react';
import { Calendar, Droplet, Sparkles, Heart, AlertCircle, Zap, Check, Info } from 'lucide-react';

export interface CycleFormData {
  startDate: string;
  endDate?: string;
  cramps: number; // 0: None, 1: Mild, 2: Moderate, 3: Severe
  flow: number;   // 0: Low, 1: Medium, 2: High
  cycleLength: number; // default 28
}

export interface CycleFormProps {
  initialData?: Partial<CycleFormData>;
  onSave: (data: CycleFormData) => Promise<void> | void;
  isLoading?: boolean;
}

export const CycleForm: React.FC<CycleFormProps> = ({
  initialData,
  onSave,
  isLoading = false,
}) => {
  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [startDate, setStartDate] = useState<string>(initialData?.startDate || getTodayISO());
  const [endDate, setEndDate] = useState<string>(initialData?.endDate || '');
  const [cramps, setCramps] = useState<number>(
    typeof initialData?.cramps === 'number' ? initialData.cramps : 0
  );
  const [flow, setFlow] = useState<number>(
    typeof initialData?.flow === 'number' ? initialData.flow : 1
  );
  const [cycleLength, setCycleLength] = useState<number>(
    initialData?.cycleLength || 28
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialData changes externally
  useEffect(() => {
    if (initialData?.startDate) setStartDate(initialData.startDate);
    if (initialData?.endDate !== undefined) setEndDate(initialData.endDate || '');
    if (typeof initialData?.cramps === 'number') setCramps(initialData.cramps);
    if (typeof initialData?.flow === 'number') setFlow(initialData.flow);
    if (initialData?.cycleLength) setCycleLength(initialData.cycleLength);
  }, [initialData]);

  const crampsOptions = [
    { value: 0, label: 'None', icon: Sparkles, color: 'text-bloom-sage' },
    { value: 1, label: 'Mild', icon: Heart, color: 'text-bloom-teal' },
    { value: 2, label: 'Moderate', icon: AlertCircle, color: 'text-bloom-gold' },
    { value: 3, label: 'Severe', icon: Zap, color: 'text-bloom-rose' },
  ];

  const flowOptions = [
    { value: 0, label: 'Low', drops: 1 },
    { value: 1, label: 'Medium', drops: 2 },
    { value: 2, label: 'High', drops: 3 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!startDate) {
      setError('Please select your period start date.');
      return;
    }

    if (endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    const validatedLength = Math.max(20, Math.min(45, Number(cycleLength) || 28));

    setIsSubmitting(true);
    try {
      await onSave({
        startDate,
        endDate: endDate || undefined,
        cramps,
        flow,
        cycleLength: validatedLength,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to save period details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = getTodayISO();

  return (
    <div className="clay-card p-5 sm:p-6 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-bloom-primary dark:text-bloom-darkPrimary">
          <Calendar size={18} />
          <h3 className="text-base sm:text-lg font-bold text-bloom-ink dark:text-bloom-darkInk">
            Log Your Period
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-bloom-mute dark:text-bloom-darkMute bg-bloom-pressed dark:bg-bloom-darkPressed px-2.5 py-0.5 rounded-full border border-bloom-line/60 dark:border-bloom-darkLine">
          Cycle Tracker
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="period-start-date"
              className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center justify-between"
            >
              <span>Period Start Date *</span>
            </label>
            <input
              id="period-start-date"
              type="date"
              max={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-[14px] bg-bloom-surface dark:bg-bloom-darkSurface text-bloom-ink dark:text-bloom-darkInk border border-bloom-line dark:border-bloom-darkLine focus:outline-none focus:ring-2 focus:ring-bloom-primary/50 shadow-clay-pressed"
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="period-end-date"
              className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center justify-between"
            >
              <span>Period End Date (Optional)</span>
            </label>
            <input
              id="period-end-date"
              type="date"
              min={startDate}
              max={todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-[14px] bg-bloom-surface dark:bg-bloom-darkSurface text-bloom-ink dark:text-bloom-darkInk border border-bloom-line dark:border-bloom-darkLine focus:outline-none focus:ring-2 focus:ring-bloom-primary/50 shadow-clay-pressed"
            />
          </div>
        </div>

        {/* Cramps Level Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk block">
            Cramps Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {crampsOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = cramps === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCramps(opt.value)}
                  aria-label={`Cramps: ${opt.label}`}
                  className={`py-2 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border text-center ${
                    isSelected
                      ? 'bg-bloom-primary/10 dark:bg-bloom-primary/20 border-bloom-primary dark:border-bloom-darkPrimary text-bloom-primary dark:text-bloom-darkPrimary shadow-sm font-bold'
                      : 'bg-bloom-surface dark:bg-bloom-darkSurface border-bloom-line/70 dark:border-bloom-darkLine text-bloom-mute hover:text-bloom-ink font-medium'
                  }`}
                >
                  <Icon size={16} className={isSelected ? opt.color : ''} />
                  <span className="text-[11px] leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Flow Level Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk block">
            Flow Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {flowOptions.map((opt) => {
              const isSelected = flow === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFlow(opt.value)}
                  aria-label={`Flow: ${opt.label}`}
                  className={`py-2 px-2 rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-95 border text-center ${
                    isSelected
                      ? 'bg-bloom-rose/15 border-bloom-rose text-bloom-ink dark:text-bloom-darkInk shadow-sm font-bold'
                      : 'bg-bloom-surface dark:bg-bloom-darkSurface border-bloom-line/70 dark:border-bloom-darkLine text-bloom-mute hover:text-bloom-ink font-medium'
                  }`}
                >
                  <div className="flex items-center -space-x-1 text-bloom-rose">
                    {Array.from({ length: opt.drops }).map((_, idx) => (
                      <Droplet
                        key={idx}
                        size={14}
                        className="fill-bloom-rose text-bloom-rose"
                      />
                    ))}
                  </div>
                  <span className="text-xs">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cycle Length Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="cycle-length-input"
            className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk flex items-center justify-between"
          >
            <span>Average Cycle Length (Days)</span>
            <span className="text-[11px] font-normal text-bloom-mute">Default: 28</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="cycle-length-input"
              type="number"
              min="20"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(Math.max(1, parseInt(e.target.value) || 28))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-[14px] bg-bloom-surface dark:bg-bloom-darkSurface text-bloom-ink dark:text-bloom-darkInk border border-bloom-line dark:border-bloom-darkLine focus:outline-none focus:ring-2 focus:ring-bloom-primary/50 shadow-clay-pressed"
            />
            <span className="text-xs font-semibold text-bloom-mute pr-1">days</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-[14px] bg-bloom-rose/15 border border-bloom-rose/40 text-bloom-ink dark:text-bloom-darkInk text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-bloom-rose flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="p-3 rounded-[14px] bg-bloom-sage/20 border border-bloom-sage/40 text-bloom-ink dark:text-bloom-darkInk text-xs flex items-center gap-2 animate-in fade-in">
            <Check size={16} className="text-bloom-sage flex-shrink-0" />
            <span className="font-semibold">Period logged and cycle updated successfully!</span>
          </div>
        )}

        {/* Submit / Save Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full h-12 rounded-full font-bold text-white btn-primary shadow-clay transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98 disabled:opacity-50"
        >
          {isSubmitting || isLoading ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check size={18} />
              <span>Save Period Details</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
