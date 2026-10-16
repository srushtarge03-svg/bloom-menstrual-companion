export interface CycleRecord {
  id?: string;
  start: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
  flow?: number;  // 0: Light, 1: Medium, 2: Heavy
  cramps?: number;// 0: None, 1: Mild, 2: Medium, 3: Severe
  mood?: number;  // 0: Happy, 1: Okay, 2: Tired, 3: Moody, 4: Sad
  symptoms?: number[]; // indices of symptoms
}

export interface CycleAnalysis {
  averageCycleLength: number; // e.g. 28
  averagePeriodLength: number; // e.g. 5
  spread: number;             // difference between longest and shortest cycle
  spreadRange: number;        // max(2, ceil(spread / 2) + 2)
  lastStartDate: Date;
  predictedNextStartDate: Date;
  predictedRangeStart: Date;
  predictedRangeEnd: Date;
  currentDayOfCycle: number;
  currentPhase: number;       // 0: Period, 1: Follicular, 2: Ovulation, 3: Luteal
  ovulationDay: number;       // averageCycleLength - 14
  gaps: number[];             // cycle lengths between consecutive periods
  latestRecord: CycleRecord;
  nudges: string[];
}

const ONE_DAY_MS = 86400000;

export function parseISODate(isoStr: string): Date {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * ONE_DAY_MS);
}

export function daysBetween(dateA: Date, dateB: Date): number {
  return Math.round((dateA.getTime() - dateB.getTime()) / ONE_DAY_MS);
}

export function formatHumanDate(date: Date, locale: string = 'en-IN'): string {
  const langTag = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN';
  return date.toLocaleDateString(langTag, { day: 'numeric', month: 'short' });
}

export function analyzeCycles(
  cycles: CycleRecord[],
  referenceToday: Date = new Date()
): CycleAnalysis | null {
  if (!cycles || cycles.length === 0) {
    return null;
  }

  // Sort chronologically by start date
  const sorted = [...cycles].sort((a, b) => a.start.localeCompare(b.start));
  const startDates = sorted.map((c) => parseISODate(c.start));

  // Compute gaps between consecutive start dates
  const gaps: number[] = [];
  for (let i = 1; i < startDates.length; i++) {
    const gap = daysBetween(startDates[i], startDates[i - 1]);
    if (gap > 0) {
      gaps.push(gap);
    }
  }

  // Average cycle length (default 28 if fewer than 2 logs)
  const averageCycleLength = gaps.length > 0
    ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
    : 28;

  // Average period bleeding length from logged start and end dates
  const periodLengths = sorted
    .filter((c) => c.end && c.end >= c.start)
    .map((c) => daysBetween(parseISODate(c.end!), parseISODate(c.start)) + 1);

  const averagePeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  // Spread across cycles
  const spread = gaps.length > 1 ? Math.max(...gaps) - Math.min(...gaps) : 0;
  const spreadRange = Math.max(2, Math.ceil(spread / 2) + 2);

  const latestRecord = sorted[sorted.length - 1];
  const lastStartDate = startDates[startDates.length - 1];

  // Normalized today (midnight)
  const todayNormalized = new Date(
    referenceToday.getFullYear(),
    referenceToday.getMonth(),
    referenceToday.getDate()
  );

  const currentDayOfCycle = Math.max(1, daysBetween(todayNormalized, lastStartDate) + 1);

  // Ovulation approximately 14 days before next period
  const ovulationDay = Math.max(1, averageCycleLength - 14);

  // 4 Menstrual phases:
  // Phase 0: Period days (Day 1 to averagePeriodLength)
  // Phase 1: Fresh start / Follicular (Day after period to ovulation - 2)
  // Phase 2: Peak energy / Ovulation 3-day window (ovulation - 1 to ovulation + 1)
  // Phase 3: Slow down / Luteal (post-ovulation until next period)
  let currentPhase = 0;
  if (currentDayOfCycle <= averagePeriodLength) {
    currentPhase = 0; // Period days
  } else if (currentDayOfCycle < ovulationDay - 1) {
    currentPhase = 1; // Follicular
  } else if (currentDayOfCycle <= ovulationDay + 1) {
    currentPhase = 2; // Ovulation window
  } else {
    currentPhase = 3; // Luteal
  }

  // If cycle is significantly past expected cycle length, stay in luteal phase
  if (currentDayOfCycle > averageCycleLength + 7) {
    currentPhase = 3;
  }

  // Predicted next period start date
  const predictedNextStartDate = addDays(lastStartDate, averageCycleLength);
  const predictedRangeStart = addDays(predictedNextStartDate, -spreadRange);
  const predictedRangeEnd = addDays(predictedNextStartDate, spreadRange);

  // Safety & Health nudges (gentle, non-diagnostic)
  const nudges: string[] = [];

  // Nudge: regular vs irregular pattern
  if (gaps.length >= 2 && spread <= 3) {
    nudges.push('regular');
  } else if (gaps.length >= 1) {
    nudges.push('varying');
  }

  // Nudge: cramps logged
  if (latestRecord.cramps && latestRecord.cramps >= 1) {
    nudges.push('cramps');
  }

  // Red flag: severe cramps (level 2 or 3) OR heavy bleeding with duration > 7 days
  const hasSevereCramps = latestRecord.cramps !== undefined && latestRecord.cramps >= 2;
  const isBleedingOver7Days = periodLengths.some((l) => l > 7);
  const isHeavyAndLong = (latestRecord.flow === 2 && isBleedingOver7Days) || hasSevereCramps;

  if (isHeavyAndLong) {
    nudges.push('redFlag');
  }

  // Nudge: prolonged absence (over 45 days or 14 days past expected)
  if (currentDayOfCycle > 45 || currentDayOfCycle > averageCycleLength + 14) {
    nudges.push('longCycle');
  }

  return {
    averageCycleLength,
    averagePeriodLength,
    spread,
    spreadRange,
    lastStartDate,
    predictedNextStartDate,
    predictedRangeStart,
    predictedRangeEnd,
    currentDayOfCycle,
    currentPhase,
    ovulationDay,
    gaps,
    latestRecord,
    nudges,
  };
}
