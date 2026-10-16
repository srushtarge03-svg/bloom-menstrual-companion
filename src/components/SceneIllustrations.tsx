import React from 'react';
import { BloomGirl } from './BloomGirl';
import { StoryboardScene } from '../data/storyboards';

export interface SceneIllustrationProps {
  scene: StoryboardScene;
  speaking?: boolean;
  paused?: boolean;
  lang?: 'en' | 'hi' | 'mr';
}

/**
 * Advanced 2D Scene Illustration Component
 * Combines the rigged BloomGirl character with precise, explanatory diagrams,
 * step counters, close-up inserts, and synchronized on-screen keywords.
 */
export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  scene,
  speaking = false,
  paused = false,
  lang = 'en',
}) => {
  const currentKeywords = scene.keywords[lang] || scene.keywords.en;
  const currentLabels = scene.labels[lang] || scene.labels.en;

  return (
    <div className="relative w-full h-56 sm:h-64 bg-bloom-surface dark:bg-bloom-darkSurface rounded-[20px] overflow-hidden border border-bloom-line/80 dark:border-bloom-darkLine flex items-center justify-between p-3 sm:p-5 shadow-inner">
      {/* Step Counter Badge (if applicable) */}
      {scene.stepNumber && scene.totalSteps && (
        <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-bloom-primary text-white text-[11px] font-bold shadow-sm">
          Step {scene.stepNumber} of {scene.totalSteps}
        </div>
      )}

      {/* Synchronized Keyword Pills (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1 max-w-[200px] justify-end pointer-events-none">
        {currentKeywords.slice(0, 2).map((kw, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bloom-pressed dark:bg-bloom-darkPressed text-bloom-ink dark:text-bloom-darkInk border border-bloom-line/70 dark:border-bloom-darkLine shadow-sm"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Girl Character on Left */}
      <div className="relative z-10 flex-shrink-0 mt-2">
        <BloomGirl
          pose={scene.girl.pose}
          expression={scene.girl.expression}
          look={scene.girl.look}
          speaking={speaking}
          size={160}
          paused={paused}
        />
      </div>

      {/* Educational Prop / Teaching Diagram on Right */}
      <div className="relative z-10 flex-1 max-w-[210px] sm:max-w-[240px] h-full flex flex-col items-center justify-center pl-2">
        {/* GROWTH CHART DIAGRAM */}
        {scene.propType === 'growth-chart-diagram' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Measuring Tape */}
            <rect x="25" y="10" width="18" height="130" rx="4" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="1.5" />
            <line x1="25" y1="30" x2="35" y2="30" stroke="var(--bloom-primary)" strokeWidth="1.5" />
            <line x1="25" y1="50" x2="38" y2="50" stroke="var(--bloom-terracotta)" strokeWidth="2" />
            <line x1="25" y1="70" x2="35" y2="70" stroke="var(--bloom-primary)" strokeWidth="1.5" />
            <line x1="25" y1="90" x2="38" y2="90" stroke="var(--bloom-teal)" strokeWidth="2" />
            <line x1="25" y1="110" x2="35" y2="110" stroke="var(--bloom-primary)" strokeWidth="1.5" />

            {/* Growth Arrow */}
            <path d="M 70 120 L 70 30 M 62 40 L 70 25 L 78 40" stroke="var(--bloom-teal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Labeled Badge */}
            <rect x="95" y="45" width="80" height="28" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="135" y="63" fontSize="10" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Height Growth'}
            </text>
            <rect x="95" y="85" width="80" height="28" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="135" y="103" fontSize="9" fontWeight="600" fill="var(--bloom-mute)" textAnchor="middle">
              {currentLabels[1] || 'Your Own Pace'}
            </text>
          </svg>
        )}

        {/* HORMONE PATHWAYS DIAGRAM */}
        {scene.propType === 'hormone-pathway-diagram' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Abstract Body Contour */}
            <path d="M 60 140 Q 55 80 75 40 Q 90 20 105 40 Q 125 80 120 140 Z" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1.5" />
            {/* Brain Messenger Center */}
            <circle cx="90" cy="35" r="10" fill="var(--bloom-primary)" />
            <circle cx="90" cy="35" r="5" fill="#FFFFFF" />
            {/* Pathway Streams */}
            <path d="M 90 45 Q 85 75 80 105" stroke="var(--bloom-terracotta)" strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M 90 45 Q 95 75 100 105" stroke="var(--bloom-terracotta)" strokeWidth="2.5" strokeDasharray="3 3" />
            {/* Ovaries / Hormones targets */}
            <circle cx="78" cy="112" r="7" fill="var(--bloom-teal)" />
            <circle cx="102" cy="112" r="7" fill="var(--bloom-teal)" />
            {/* Labels */}
            <rect x="115" y="24" width="60" height="22" rx="6" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="145" y="38" fontSize="8" fontWeight="700" fill="var(--bloom-primary)" textAnchor="middle">Brain Signal</text>
            <rect x="115" y="102" width="60" height="22" rx="6" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="145" y="116" fontSize="8" fontWeight="700" fill="var(--bloom-teal)" textAnchor="middle">Hormones</text>
          </svg>
        )}

        {/* UTERINE CUSHION DIAGRAM */}
        {scene.propType === 'uterine-cushion-diagram' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Uterine Outer Wall */}
            <path d="M 40 40 Q 90 25 140 40 Q 145 95 90 135 Q 35 95 40 40 Z" fill="var(--bloom-rose)" fillOpacity="0.18" stroke="var(--bloom-rose)" strokeWidth="2" />
            {/* Soft Cushion Lining */}
            <path d="M 55 52 Q 90 42 125 52 Q 130 90 90 120 Q 50 90 55 52 Z" fill="var(--bloom-terracotta)" fillOpacity="0.25" stroke="var(--bloom-terracotta)" strokeWidth="2" strokeDasharray="4 3" />
            {/* Tiny Capillary Buds */}
            <circle cx="75" cy="70" r="3" fill="var(--bloom-terracotta)" />
            <circle cx="105" cy="70" r="3" fill="var(--bloom-terracotta)" />
            <circle cx="90" cy="90" r="3.5" fill="var(--bloom-terracotta)" />
            {/* Label */}
            <rect x="35" y="125" width="110" height="22" rx="7" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="139" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Uterus Cushion Layer'}
            </text>
          </svg>
        )}

        {/* NATURAL RESET FLOW */}
        {scene.propType === 'natural-reset-flow' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Circular Cycle Reset Arrow */}
            <path d="M 90 25 A 45 45 0 1 1 45 70" stroke="var(--bloom-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <polygon points="45,62 38,76 52,74" fill="var(--bloom-primary)" />
            {/* Clean Drop Element */}
            <path d="M 90 55 C 90 55 78 72 78 82 C 78 88 83 93 90 93 C 97 93 102 88 102 82 C 102 72 90 55 90 55 Z" fill="var(--bloom-rose)" stroke="var(--bloom-terracotta)" strokeWidth="1.5" />
            {/* Checkmark */}
            <circle cx="125" cy="55" r="12" fill="var(--bloom-sage)" />
            <path d="M 120 55 L 123 58 L 130 51" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Label */}
            <rect x="30" y="120" width="120" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="135" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Healthy Reset'}
            </text>
          </svg>
        )}

        {/* PAD ANATOMY BREAKDOWN */}
        {scene.propType === 'pad-anatomy-breakdown' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Main Pad Body */}
            <rect x="40" y="25" width="100" height="60" rx="30" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="2" />
            {/* Soft Top Sheet Layer */}
            <rect x="52" y="33" width="76" height="44" rx="22" fill="var(--bloom-pressed)" stroke="var(--bloom-terracotta)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Absorbent Core */}
            <rect x="65" y="42" width="50" height="26" rx="12" fill="var(--bloom-teal)" fillOpacity="0.25" stroke="var(--bloom-teal)" strokeWidth="1.5" />
            {/* Wings Extended */}
            <path d="M 70 25 C 70 12 110 12 110 25 Z" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="1.5" />
            <path d="M 70 85 C 70 98 110 98 110 85 Z" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="1.5" />
            {/* Explanatory Annotations */}
            <text x="90" y="58" fontSize="8" fontWeight="700" fill="var(--bloom-primary)" textAnchor="middle">Absorbent Core</text>
            <rect x="25" y="112" width="130" height="24" rx="7" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="127" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Cotton Soft Top Sheet'}
            </text>
          </svg>
        )}

        {/* STEP 1: PAD PEEL */}
        {scene.propType === 'pad-step-peel' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Pad backing */}
            <rect x="45" y="20" width="90" height="50" rx="24" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="2" />
            {/* Long Center Strip being peeled */}
            <rect x="60" y="32" width="60" height="26" rx="6" fill="var(--bloom-terracotta)" fillOpacity="0.3" stroke="var(--bloom-terracotta)" strokeWidth="1.5" />
            {/* Peeled Paper Strip Lifting */}
            <path d="M 115 32 Q 135 15 145 20 Q 140 38 120 38 Z" fill="#FFFFFF" stroke="var(--bloom-gold)" strokeWidth="1.5" />
            {/* Action Arrow */}
            <path d="M 110 45 L 140 28" stroke="var(--bloom-primary)" strokeWidth="2" strokeDasharray="3 2" markerEnd="url(#arrow)" />
            {/* Step Label */}
            <rect x="20" y="112" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="127" fontSize="9" fontWeight="700" fill="var(--bloom-primary)" textAnchor="middle">
              {currentLabels[0] || 'Step 1: Peel Central Strip'}
            </text>
          </svg>
        )}

        {/* STEP 2: PAD PRESS ON UNDERWEAR */}
        {scene.propType === 'pad-step-press' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Underwear Outline */}
            <path d="M 35 30 L 145 30 L 130 90 Q 90 115 50 90 Z" fill="none" stroke="var(--bloom-mute)" strokeWidth="2" strokeDasharray="4 3" />
            {/* Pad Placed in Center */}
            <rect x="65" y="36" width="50" height="68" rx="20" fill="#FFFFFF" stroke="var(--bloom-teal)" strokeWidth="2.5" />
            {/* Alignment Guideline & Finger Press Arrows */}
            <line x1="90" y1="42" x2="90" y2="98" stroke="var(--bloom-teal)" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="90" cy="70" r="14" fill="var(--bloom-teal)" fillOpacity="0.2" />
            <text x="90" y="73" fontSize="8" fontWeight="700" fill="var(--bloom-teal)" textAnchor="middle">Press Firmly</text>
            {/* Step Label */}
            <rect x="20" y="118" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="133" fontSize="9" fontWeight="700" fill="var(--bloom-primary)" textAnchor="middle">
              {currentLabels[0] || 'Step 2: Press in Center'}
            </text>
          </svg>
        )}

        {/* STEP 3: WRAP WINGS */}
        {scene.propType === 'pad-step-wings' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Underwear Fabric Profile */}
            <path d="M 45 45 C 55 45 65 75 75 75 L 105 75 C 115 75 125 45 135 45" fill="none" stroke="var(--bloom-mute)" strokeWidth="2" />
            {/* Pad Body with Wings Wrapped Under Fabric */}
            <rect x="68" y="58" width="44" height="42" rx="14" fill="#FFFFFF" stroke="var(--bloom-primary)" strokeWidth="2" />
            <path d="M 68 68 Q 58 75 64 84 Q 72 84 72 75 Z" fill="var(--bloom-primary)" fillOpacity="0.4" stroke="var(--bloom-primary)" strokeWidth="1.5" />
            <path d="M 112 68 Q 122 75 116 84 Q 108 84 108 75 Z" fill="var(--bloom-primary)" fillOpacity="0.4" stroke="var(--bloom-primary)" strokeWidth="1.5" />
            {/* Success Shield */}
            <circle cx="90" cy="79" r="12" fill="var(--bloom-sage)" />
            <path d="M 85 79 L 88 82 L 95 75" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Step Label */}
            <rect x="20" y="118" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="133" fontSize="9" fontWeight="700" fill="var(--bloom-primary)" textAnchor="middle">
              {currentLabels[0] || 'Step 3: Fold Wings Underneath'}
            </text>
          </svg>
        )}

        {/* TIMER CHANGE INTERVAL */}
        {scene.propType === 'timer-change-interval' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Clock Face */}
            <circle cx="90" cy="65" r="45" fill="#FFFFFF" stroke="var(--bloom-line)" strokeWidth="2" />
            {/* Highlighted 4-6 Hours Slice */}
            <path d="M 90 65 L 128 40 A 45 45 0 0 1 122 98 Z" fill="var(--bloom-teal)" fillOpacity="0.3" stroke="var(--bloom-teal)" strokeWidth="1.5" />
            {/* Clock Hands */}
            <line x1="90" y1="65" x2="90" y2="35" stroke="var(--bloom-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="90" y1="65" x2="118" y2="78" stroke="var(--bloom-primary)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="90" cy="65" r="3.5" fill="var(--bloom-primary)" />
            {/* Banner */}
            <rect x="20" y="118" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="133" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Every 4 to 6 Hours'}
            </text>
          </svg>
        )}

        {/* DUSTBIN DISPOSAL & PAPER WRAP */}
        {scene.propType === 'dustbin-paper-wrap' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Wrapped Pad Packet */}
            <rect x="30" y="45" width="45" height="30" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-terracotta)" strokeWidth="1.5" />
            <line x1="30" y1="60" x2="75" y2="60" stroke="var(--bloom-terracotta)" strokeWidth="1" strokeDasharray="2 2" />
            {/* Covered Waste Bin */}
            <path d="M 115 50 L 145 50 L 140 100 L 120 100 Z" fill="#FFFFFF" stroke="var(--bloom-primary)" strokeWidth="2" />
            <rect x="110" y="42" width="40" height="8" rx="3" fill="var(--bloom-primary)" />
            {/* Curved Arrow into Bin */}
            <path d="M 78 55 Q 98 35 118 52" stroke="var(--bloom-teal)" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
            {/* Do not flush warning note */}
            <rect x="20" y="118" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="133" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Dustbin Only - Never Flush'}
            </text>
          </svg>
        )}

        {/* CRAMPS COMFORT HOT WATER BOTTLE */}
        {scene.propType === 'cramps-comfort-bottle' && (
          <svg viewBox="0 0 180 150" className="w-full h-auto overflow-visible">
            {/* Hot Water Bottle Body */}
            <rect x="60" y="42" width="60" height="66" rx="14" fill="var(--bloom-terracotta)" stroke="var(--bloom-terracotta)" strokeWidth="2" />
            {/* Bottle Neck and Cap */}
            <path d="M 80 42 L 80 28 L 100 28 L 100 42 Z" fill="var(--bloom-terracotta)" />
            <rect x="76" y="24" width="28" height="6" rx="2" fill="var(--bloom-primary)" />
            {/* Ribbed Texture */}
            <line x1="68" y1="58" x2="112" y2="58" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2" />
            <line x1="68" y1="72" x2="112" y2="72" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2" />
            <line x1="68" y1="86" x2="112" y2="86" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2" />
            {/* Warmth Radiance Waves */}
            <path d="M 50 60 Q 42 75 50 90" stroke="var(--bloom-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 130 60 Q 138 75 130 90" stroke="var(--bloom-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Banner */}
            <rect x="20" y="120" width="140" height="24" rx="8" fill="var(--bloom-pressed)" stroke="var(--bloom-line)" strokeWidth="1" />
            <text x="90" y="135" fontSize="9" fontWeight="700" fill="var(--bloom-ink)" textAnchor="middle">
              {currentLabels[0] || 'Gentle Warmth on Tummy'}
            </text>
          </svg>
        )}

        {/* DEFAULT FALLBACK TEACHING DIAGRAM */}
        {!['growth-chart-diagram', 'hormone-pathway-diagram', 'uterine-cushion-diagram', 'natural-reset-flow', 'pad-anatomy-breakdown', 'pad-step-peel', 'pad-step-press', 'pad-step-wings', 'timer-change-interval', 'dustbin-paper-wrap', 'cramps-comfort-bottle'].includes(scene.propType) && (
          <div className="w-full flex flex-col items-center justify-center p-2 text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line flex items-center justify-center text-bloom-primary">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <span className="text-xs font-bold text-bloom-ink dark:text-bloom-darkInk">
              {currentLabels[0] || scene.title[lang] || scene.title.en}
            </span>
            <span className="text-[10px] font-semibold text-bloom-mute dark:text-bloom-darkMute">
              {currentLabels[1] || 'Gentle Self-Care'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
