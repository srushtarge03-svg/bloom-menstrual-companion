import React from 'react';
import { Droplet, Sprout, Sun, Moon, AlertTriangle, RefreshCw } from 'lucide-react';

export interface CyclePhaseBoundary {
  index: number;
  id: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  name: string;
  startDay: number;
  endDay: number;
  color: string;
  fadeColor: string;
  icon: React.FC<{ size: number; className?: string }>;
}

export interface CycleRingProps {
  currentDay: number;
  cycleLength: number;
  selectedPhase: number; // 0: Menstrual, 1: Follicular, 2: Ovulation, 3: Luteal
  onSelectPhase: (phaseIndex: number) => void;
  onPromptNewPeriod?: () => void;
}

// Convert polar angle to cartesian coordinates (12 o'clock = 0 deg)
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate SVG arc path from startAngle to endAngle
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export const CycleRing: React.FC<CycleRingProps> = ({
  currentDay,
  cycleLength,
  selectedPhase,
  onSelectPhase,
  onPromptNewPeriod,
}) => {
  const L = Math.max(20, Math.min(45, cycleLength || 28));

  // Scale phase boundaries proportionally to cycle length
  const menstrualEnd = Math.max(3, Math.min(7, Math.round(L * (5 / 28))));
  const ovulationDay = Math.max(menstrualEnd + 2, L - 14);
  const ovulationStart = ovulationDay - 1;
  const ovulationEnd = ovulationDay + 1;

  const phases: CyclePhaseBoundary[] = [
    {
      index: 0,
      id: 'menstrual',
      name: 'Menstrual',
      startDay: 1,
      endDay: menstrualEnd,
      color: '#D96B82', // Deep red / rose
      fadeColor: 'rgba(217, 107, 130, 0.28)',
      icon: Droplet,
    },
    {
      index: 1,
      id: 'follicular',
      name: 'Follicular',
      startDay: menstrualEnd + 1,
      endDay: ovulationStart - 1,
      color: '#5E8F8B', // Soft green / teal
      fadeColor: 'rgba(94, 143, 139, 0.28)',
      icon: Sprout,
    },
    {
      index: 2,
      id: 'ovulation',
      name: 'Ovulation',
      startDay: ovulationStart,
      endDay: ovulationEnd,
      color: '#D2AE6D', // Golden yellow / orange
      fadeColor: 'rgba(210, 174, 109, 0.28)',
      icon: Sun,
    },
    {
      index: 3,
      id: 'luteal',
      name: 'Luteal',
      startDay: ovulationEnd + 1,
      endDay: L,
      color: '#8A6A99', // Purple / lavender
      fadeColor: 'rgba(138, 106, 153, 0.28)',
      icon: Moon,
    },
  ];

  // Determine current active phase
  let activePhaseIndex = 0;
  if (currentDay <= menstrualEnd) {
    activePhaseIndex = 0;
  } else if (currentDay < ovulationStart) {
    activePhaseIndex = 1;
  } else if (currentDay <= ovulationEnd) {
    activePhaseIndex = 2;
  } else {
    activePhaseIndex = 3;
  }

  // Days remaining until next phase
  let remainingText = '';
  if (currentDay <= menstrualEnd) {
    const rem = menstrualEnd - currentDay + 1;
    remainingText = `${rem} ${rem === 1 ? 'day' : 'days'} until Follicular`;
  } else if (currentDay < ovulationStart) {
    const rem = ovulationStart - currentDay;
    remainingText = `${rem} ${rem === 1 ? 'day' : 'days'} until Ovulation`;
  } else if (currentDay <= ovulationEnd) {
    const rem = ovulationEnd - currentDay + 1;
    remainingText = `${rem} ${rem === 1 ? 'day' : 'days'} until Luteal`;
  } else if (currentDay <= L) {
    const rem = L - currentDay + 1;
    remainingText = `${rem} ${rem === 1 ? 'day' : 'days'} until Menstrual`;
  } else {
    remainingText = 'Cycle complete';
  }

  const isPastCycle = currentDay > L;

  // Ring geometry
  const cx = 135;
  const cy = 135;
  const r = 94;
  const gapDeg = 2.4; // Clean visual gap between arcs

  // Today marker angle (starts at top, clockwise)
  const clampedDay = Math.max(1, Math.min(currentDay, L));
  const todayAngle = ((clampedDay - 0.5) / L) * 360;
  const markerPos = polarToCartesian(cx, cy, r, todayAngle);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* SVG Clock Ring */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          viewBox="0 0 270 270"
          className="w-full h-full overflow-visible drop-shadow-sm"
          role="img"
          aria-label={`Cycle clock ring: currently Day ${currentDay} of ${L}`}
        >
          <defs>
            {/* Glowing filter for today marker */}
            <filter id="ringMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Inner shadow filter */}
            <filter id="softInnerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Background Track Guide */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-bloom-line/35 dark:text-bloom-darkLine/35"
            strokeWidth="16"
          />

          {/* 4 Colored Arcs */}
          {phases.map((ph) => {
            const startAngle = ((ph.startDay - 1) / L) * 360 + gapDeg / 2;
            const endAngle = (ph.endDay / L) * 360 - gapDeg / 2;
            const isPhaseActive = ph.index === activePhaseIndex;
            const isPhaseSelected = ph.index === selectedPhase;

            const strokeWidth = isPhaseActive ? 22 : 16;
            const strokeColor = isPhaseActive ? ph.color : ph.fadeColor;
            const arcPath = describeArc(cx, cy, r, startAngle, endAngle);

            // Midpoint for icon placement on arc
            const midAngle = (startAngle + endAngle) / 2;
            const iconPos = polarToCartesian(cx, cy, r, midAngle);
            const PhaseIcon = ph.icon;

            return (
              <g
                key={ph.id}
                onClick={() => onSelectPhase(ph.index)}
                className="cursor-pointer transition-all duration-300 group"
                role="button"
                tabIndex={0}
                aria-label={`${ph.name} phase: Days ${ph.startDay} to ${ph.endDay}. Tap to view.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectPhase(ph.index);
                  }
                }}
              >
                {/* Click target arc */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="transition-all duration-300 group-hover:opacity-90"
                  style={{
                    filter: isPhaseSelected ? 'drop-shadow(0 0 6px rgba(92,61,107,0.3))' : undefined,
                  }}
                />

                {/* Selected phase outer ring highlight */}
                {isPhaseSelected && (
                  <path
                    d={arcPath}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.7}
                  />
                )}

                {/* Phase Icon embedded on arc */}
                <g transform={`translate(${iconPos.x - 7}, ${iconPos.y - 7})`} className="pointer-events-none">
                  <PhaseIcon
                    size={14}
                    className={isPhaseActive ? 'text-white' : 'text-bloom-ink/70 dark:text-bloom-darkInk/70'}
                  />
                </g>
              </g>
            );
          })}

          {/* Today Glowing Marker */}
          {!isPastCycle && (
            <g
              className="transition-all duration-700 ease-out pointer-events-none"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
              }}
            >
              {/* Pulsing halo */}
              <circle
                cx={markerPos.x}
                cy={markerPos.y}
                r="13"
                fill={phases[activePhaseIndex]?.color || '#5C3D6B'}
                opacity="0.28"
                className="animate-ping"
              />
              {/* Outer white ring */}
              <circle
                cx={markerPos.x}
                cy={markerPos.y}
                r="9.5"
                fill="#FFFFFF"
                stroke={phases[activePhaseIndex]?.color || '#5C3D6B'}
                strokeWidth="3.5"
                filter="url(#ringMarkerGlow)"
              />
              {/* Inner core */}
              <circle
                cx={markerPos.x}
                cy={markerPos.y}
                r="3.5"
                fill={phases[activePhaseIndex]?.color || '#5C3D6B'}
              />
            </g>
          )}

          {/* Central Hollow Disc (Claymorphism Face) */}
          <circle
            cx={cx}
            cy={cy}
            r="64"
            className="fill-bloom-surface dark:fill-bloom-darkSurface stroke-bloom-line/80 dark:stroke-bloom-darkLine"
            strokeWidth="2"
            filter="url(#softInnerShadow)"
          />
        </svg>

        {/* Center Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
            Cycle Progress
          </span>

          <div className="text-3xl sm:text-4xl font-extrabold text-bloom-ink dark:text-bloom-darkInk tracking-tight my-0.5">
            Day {currentDay}
          </div>

          <div
            className="text-xs sm:text-sm font-bold leading-tight"
            style={{ color: phases[activePhaseIndex]?.color || 'inherit' }}
          >
            {phases[activePhaseIndex]?.name} Phase
          </div>

          <div className="text-[10px] sm:text-[11px] font-semibold text-bloom-mute dark:text-bloom-darkMute mt-1 max-w-[130px] leading-tight">
            {remainingText}
          </div>
        </div>
      </div>

      {/* Phase Legends & Arc Selector Pills */}
      <div className="grid grid-cols-4 gap-1.5 w-full mt-2 max-w-sm px-1">
        {phases.map((ph) => {
          const isSelected = selectedPhase === ph.index;
          const isCurrent = activePhaseIndex === ph.index;
          const Icon = ph.icon;

          return (
            <button
              key={ph.id}
              type="button"
              onClick={() => onSelectPhase(ph.index)}
              className={`py-2 px-1 rounded-[16px] flex flex-col items-center gap-1 transition-all text-center border active:scale-95 ${
                isSelected
                  ? 'bg-bloom-card dark:bg-bloom-darkCard border-bloom-primary dark:border-bloom-darkPrimary shadow-clay font-bold'
                  : 'bg-bloom-surface dark:bg-bloom-darkSurface border-bloom-line/70 dark:border-bloom-darkLine text-bloom-mute font-medium hover:text-bloom-ink'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: ph.color }}
              >
                <Icon size={12} />
              </div>
              <span className="text-[10px] leading-tight font-bold text-bloom-ink dark:text-bloom-darkInk">
                {ph.name}
              </span>
              <span className="text-[9px] text-bloom-mute">
                d.{ph.startDay}-{ph.endDay}
              </span>
              {isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-bloom-primary dark:bg-bloom-darkPrimary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Prompt If Today is Past Cycle Length */}
      {isPastCycle && (
        <div className="mt-4 p-4 rounded-[20px] bg-bloom-gold/15 border border-bloom-gold/40 text-bloom-ink dark:text-bloom-darkInk w-full max-w-sm space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs text-bloom-ink dark:text-bloom-darkInk">
            <AlertTriangle size={17} className="text-bloom-gold flex-shrink-0" />
            <span>New cycle may have started</span>
          </div>
          <p className="text-xs text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed">
            You are on Day {currentDay}, which is past your average {L}-day cycle. Cycles naturally vary, but if your period has arrived, please log your new start date above!
          </p>
          {onPromptNewPeriod && (
            <button
              type="button"
              onClick={onPromptNewPeriod}
              className="mt-1 w-full py-2 px-3 rounded-full bg-bloom-gold/30 hover:bg-bloom-gold/40 text-bloom-ink dark:text-bloom-darkInk font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Log New Period Above</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
