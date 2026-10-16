import React from 'react';
import { useTranslation } from 'react-i18next';
import { Droplet, Sprout, Sun, Moon } from 'lucide-react';
import { CycleAnalysis } from '../utils/cycleMath';

export interface CycleDialProps {
  analysis: CycleAnalysis;
}

export const CycleDial: React.FC<CycleDialProps> = ({ analysis }) => {
  const { t } = useTranslation();

  const {
    averageCycleLength,
    averagePeriodLength,
    ovulationDay,
    currentDayOfCycle,
    currentPhase,
  } = analysis;

  // Compute angle boundaries for the 4 phases
  const p0EndPct = Math.min(100, (averagePeriodLength / averageCycleLength) * 100);
  const p1EndPct = Math.min(100, ((ovulationDay - 2) / averageCycleLength) * 100);
  const p2EndPct = Math.min(100, ((ovulationDay + 1) / averageCycleLength) * 100);

  // Angle of current day pointer on 360 degree circle
  const dayAngle = ((Math.min(currentDayOfCycle, averageCycleLength) - 0.5) / averageCycleLength) * 360;

  // Vibrant clay phase colors: rose, teal, gold, radiant plum
  const phaseColors = ['#FF5E88', '#14B8A6', '#F5A623', '#8A388F'];
  const phaseNames = [
    t('cycle.phases.p0.name'),
    t('cycle.phases.p1.name'),
    t('cycle.phases.p2.name'),
    t('cycle.phases.p3.name'),
  ];
  const phaseDescriptions = [
    t('cycle.phases.p0.description'),
    t('cycle.phases.p1.description'),
    t('cycle.phases.p2.description'),
    t('cycle.phases.p3.description'),
  ];

  const PhaseIcon = [Droplet, Sprout, Sun, Moon][currentPhase] || Droplet;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dial Wheel */}
      <div className="relative w-52 h-52 my-2 flex items-center justify-center">
        {/* Conic Gradient Ring */}
        <div
          className="w-full h-full rounded-full shadow-clay dark:shadow-clay-dark p-3.5 flex items-center justify-center transition-all duration-500"
          style={{
            background: `conic-gradient(
              ${phaseColors[0]} 0% ${p0EndPct}%,
              ${phaseColors[1]} ${p0EndPct}% ${p1EndPct}%,
              ${phaseColors[2]} ${p1EndPct}% ${p2EndPct}%,
              ${phaseColors[3]} ${p2EndPct}% 100%
            )`,
          }}
        >
          {/* Inner Clay Hollow Disk */}
          <div className="w-36 h-36 rounded-full bg-bloom-card dark:bg-bloom-darkCard shadow-clay-pressed dark:shadow-clay-dark-pressed flex flex-col items-center justify-center text-center p-2 z-10 border border-bloom-line/70 dark:border-bloom-darkLine">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mb-1 text-white shadow-sm"
              style={{ backgroundColor: phaseColors[currentPhase] }}
            >
              <PhaseIcon size={18} />
            </div>

            <span className="font-bold text-sm text-bloom-ink dark:text-bloom-darkInk leading-tight line-clamp-1">
              {phaseNames[currentPhase]}
            </span>

            <span className="text-[11px] font-semibold text-bloom-mute dark:text-bloom-darkMute mt-0.5">
              {t('cycle.dayCount', {
                day: currentDayOfCycle,
                total: averageCycleLength,
              })}
            </span>
          </div>
        </div>

        {/* Current Day Rotating Pointer */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${dayAngle}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-5 h-5 rounded-full bg-white dark:bg-bloom-darkCard border-[3px] border-bloom-primary dark:border-bloom-darkPrimary shadow-sm" />
        </div>
      </div>

      {/* Phase Legends */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-2 px-2">
        {phaseColors.map((color, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-bloom-mute dark:text-bloom-darkMute">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span>{phaseNames[idx].split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Phase Detailed Description */}
      <div className="mt-3.5 p-3.5 rounded-[18px] bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine text-xs text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium text-center">
        {phaseDescriptions[currentPhase]}
      </div>
    </div>
  );
};
