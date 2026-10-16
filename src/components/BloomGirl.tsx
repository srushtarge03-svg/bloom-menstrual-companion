import React from 'react';

export type GirlPose =
  | 'calm'
  | 'waving'
  | 'pointing'
  | 'holding-pad'
  | 'explaining'
  | 'thinking'
  | 'resting'
  | 'washroom-prep'
  | 'breathing';

export type GirlExpression = 'happy' | 'curious' | 'worried' | 'relieved' | 'proud';
export type GirlLook = 'center' | 'left' | 'right' | 'up';

export interface BloomGirlProps {
  pose?: GirlPose;
  expression?: GirlExpression;
  look?: GirlLook;
  speaking?: boolean;
  size?: number | string;
  className?: string;
  paused?: boolean;
}

/**
 * Advanced 2D Rigged Character Component
 * Represents a consistent 8-10 year old girl with layered rigging:
 * Head, hair with gentle sway, blinking eyes, expressive eyebrows, speech-synced mouth,
 * breathing torso, poseable arms, legs, and age-appropriate kurta outfit.
 */
export const BloomGirl: React.FC<BloomGirlProps> = ({
  pose = 'calm',
  expression = 'happy',
  look = 'center',
  speaking = false,
  size = 180,
  className = '',
  paused = false,
}) => {
  const isSpeaking = speaking && !paused;

  // Eyebrow paths based on emotional expression
  const getEyebrows = () => {
    switch (expression) {
      case 'worried':
        return {
          left: 'M 72 82 Q 80 88 88 84',
          right: 'M 112 84 Q 120 88 128 82',
        };
      case 'curious':
        return {
          left: 'M 72 80 Q 80 76 88 82',
          right: 'M 112 84 Q 120 82 128 86',
        };
      case 'relieved':
      case 'happy':
        return {
          left: 'M 72 82 Q 80 77 88 81',
          right: 'M 112 81 Q 120 77 128 82',
        };
      case 'proud':
        return {
          left: 'M 72 80 Q 80 75 88 79',
          right: 'M 112 79 Q 120 75 128 80',
        };
      default:
        return {
          left: 'M 72 82 Q 80 78 88 82',
          right: 'M 112 82 Q 120 78 128 82',
        };
    }
  };

  // Pupil offsets based on look direction
  const getPupilOffset = () => {
    switch (look) {
      case 'left':
        return { x: -2.5, y: 0 };
      case 'right':
        return { x: 2.5, y: 0 };
      case 'up':
        return { x: 0, y: -2 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const eyebrows = getEyebrows();
  const pupilOffset = getPupilOffset();

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Bloom girl character with ${pose} pose and ${expression} expression`}
    >
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible transition-transform duration-300 ${
          paused ? 'paused-animation' : ''
        }`}
      >
        <defs>
          {/* Theme Skin Gradients */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C2A4" />
            <stop offset="100%" stopColor="#E6A382" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E2433" />
            <stop offset="100%" stopColor="#1B1420" />
          </linearGradient>

          {/* Kurta Radiant Orchid Theme Gradients using CSS variable tokens */}
          <linearGradient id="kurtaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--bloom-primary, #8A388F)" />
            <stop offset="100%" stopColor="#68256D" />
          </linearGradient>

          <linearGradient id="kurtaTrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bloom-terracotta, #FF7854)" />
            <stop offset="100%" stopColor="#E65A36" />
          </linearGradient>

          <linearGradient id="padGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EDE6F2" />
          </linearGradient>

          <filter id="subtleClayShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2A2330" floodOpacity="0.12" />
          </filter>
        </defs>

        <style>
          {`
            @keyframes girlBreathe {
              0%, 100% { transform: scale(1) translateY(0); }
              50% { transform: scale(1.015) translateY(-1.5px); }
            }
            @keyframes girlBlink {
              0%, 88%, 94%, 100% { transform: scaleY(1); }
              91% { transform: scaleY(0.08); }
            }
            @keyframes girlHairSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(2.5deg); }
            }
            @keyframes girlMouthVisemes {
              0% { transform: scaleY(0.4) scaleX(0.9); }
              30% { transform: scaleY(1.3) scaleX(1.1); }
              60% { transform: scaleY(0.7) scaleX(0.95); }
              100% { transform: scaleY(1.4) scaleX(1); }
            }
            @keyframes girlWaveArm {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-22deg); }
            }
            .rig-breathe {
              transform-origin: 100px 150px;
              animation: ${paused ? 'none' : 'girlBreathe 3.6s ease-in-out infinite'};
            }
            .rig-blink {
              transform-origin: 100px 93px;
              animation: ${paused ? 'none' : 'girlBlink 4.5s infinite'};
            }
            .rig-sway-left {
              transform-origin: 52px 82px;
              animation: ${paused ? 'none' : 'girlHairSway 3s ease-in-out infinite'};
            }
            .rig-sway-right {
              transform-origin: 148px 82px;
              animation: ${paused ? 'none' : 'girlHairSway 3s ease-in-out infinite reverse'};
            }
            .rig-speaking {
              transform-origin: 100px 108px;
              animation: ${isSpeaking ? 'girlMouthVisemes 0.28s ease-in-out infinite alternate' : 'none'};
            }
            .rig-wave {
              transform-origin: 136px 140px;
              animation: ${paused ? 'none' : 'girlWaveArm 1.4s ease-in-out infinite'};
            }
          `}
        </style>

        {/* --- LAYER 1: BACK HAIR & PIGTAILS --- */}
        <g id="backHair" filter="url(#subtleClayShadow)">
          {/* Left Pigtail */}
          <g className="rig-sway-left">
            <path
              d="M 54 86 C 36 94 28 116 36 132 C 44 144 56 142 58 132 C 60 118 58 100 54 86 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Tie Coral */}
            <circle cx="53" cy="90" r="5" fill="var(--bloom-terracotta, #FF7854)" />
          </g>

          {/* Right Pigtail */}
          <g className="rig-sway-right">
            <path
              d="M 146 86 C 164 94 172 116 164 132 C 156 144 144 142 142 132 C 140 118 142 100 146 86 Z"
              fill="url(#hairGrad)"
            />
            {/* Hair Tie Coral */}
            <circle cx="147" cy="90" r="5" fill="var(--bloom-terracotta, #FF7854)" />
          </g>
        </g>

        {/* --- LAYER 2: LEGS & SHOES --- */}
        <g id="legs" className="rig-breathe">
          {/* Left Leg */}
          <rect x="85" y="196" width="10" height="26" rx="5" fill="#EBE2F0" />
          <ellipse cx="88" cy="223" rx="8" ry="4" fill="var(--bloom-primary, #8A388F)" />

          {/* Right Leg */}
          <rect x="105" y="196" width="10" height="26" rx="5" fill="#EBE2F0" />
          <ellipse cx="108" cy="223" rx="8" ry="4" fill="var(--bloom-primary, #8A388F)" />
        </g>

        {/* --- LAYER 3: TORSO & KURTA (BREATHING RIG) --- */}
        <g id="torso" className="rig-breathe" filter="url(#subtleClayShadow)">
          {/* Kurta Body */}
          <path
            d="M 76 136 Q 100 134 124 136 L 138 198 Q 100 202 62 198 Z"
            fill="url(#kurtaGrad)"
          />

          {/* Kurta Terracotta Trim & Center Placket */}
          <path
            d="M 98 135 L 102 135 L 102 186 L 98 186 Z"
            fill="url(#kurtaTrim)"
            opacity="0.9"
          />
          <path
            d="M 64 195 Q 100 199 136 195 L 137 198 Q 100 202 63 198 Z"
            fill="url(#kurtaTrim)"
          />

          {/* Neck opening */}
          <path
            d="M 92 135 Q 100 144 108 135 Z"
            fill="url(#skinGrad)"
          />
        </g>

        {/* --- LAYER 4: HEAD, FACE & FEATURES --- */}
        <g id="headGroup" className="rig-breathe">
          {/* Neck */}
          <rect x="94" y="122" width="12" height="16" rx="4" fill="url(#skinGrad)" />

          {/* Head base */}
          <ellipse cx="100" cy="94" rx="36" ry="34" fill="url(#skinGrad)" filter="url(#subtleClayShadow)" />

          {/* Soft Blushing Cheeks */}
          <circle cx="76" cy="102" r="5.5" fill="#F08F87" opacity="0.32" />
          <circle cx="124" cy="102" r="5.5" fill="#F08F87" opacity="0.32" />

          {/* Eyebrows (Dynamic Expression) */}
          <path d={eyebrows.left} stroke="#3E2E28" strokeWidth="2.2" strokeLinecap="round" />
          <path d={eyebrows.right} stroke="#3E2E28" strokeWidth="2.2" strokeLinecap="round" />

          {/* Eyes (Blinking Rig) */}
          <g className="rig-blink">
            {/* Left Eye */}
            <ellipse cx="80" cy="93" rx="5.2" ry="5.8" fill="#FFFFFF" />
            <circle
              cx={80 + pupilOffset.x}
              cy={93 + pupilOffset.y}
              r="3.6"
              fill="#2E2218"
            />
            <circle cx={78.5 + pupilOffset.x} cy={91.5 + pupilOffset.y} r="1.3" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="120" cy="93" rx="5.2" ry="5.8" fill="#FFFFFF" />
            <circle
              cx={120 + pupilOffset.x}
              cy={93 + pupilOffset.y}
              r="3.6"
              fill="#2E2218"
            />
            <circle cx={118.5 + pupilOffset.x} cy={91.5 + pupilOffset.y} r="1.3" fill="#FFFFFF" />
          </g>

          {/* Nose */}
          <path d="M 98 98 Q 100 102 102 98" stroke="#D48A68" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Mouth (Speech Synced & Expression-aware) */}
          {isSpeaking ? (
            <ellipse
              cx="100"
              cy="109"
              rx="5"
              ry="4"
              fill="#993838"
              className="rig-speaking"
            />
          ) : expression === 'worried' ? (
            <path d="M 95 111 Q 100 107 105 111" stroke="#873535" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : expression === 'curious' ? (
            <circle cx="100" cy="109" r="2.8" fill="#873535" />
          ) : (
            <path d="M 94 107 Q 100 113 106 107" stroke="#873535" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          )}

          {/* Front Hair Bangs */}
          <path
            d="M 64 86 C 68 64 92 60 100 60 C 114 60 134 66 136 86 C 132 80 120 78 114 80 C 104 83 94 77 86 82 C 78 86 70 82 64 86 Z"
            fill="url(#hairGrad)"
          />
        </g>

        {/* --- LAYER 5: ARMS & PROPS (POSE-DEPENDENT) --- */}
        <g id="arms">
          {pose === 'waving' && (
            <>
              {/* Left arm resting */}
              <path
                d="M 76 140 Q 64 156 68 174"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Right arm waving up */}
              <g className="rig-wave">
                <path
                  d="M 124 140 Q 146 128 152 106"
                  stroke="url(#skinGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle cx="154" cy="102" r="6" fill="url(#skinGrad)" />
              </g>
            </>
          )}

          {pose === 'pointing' && (
            <>
              {/* Left arm calm */}
              <path
                d="M 76 140 Q 66 156 68 174"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Right arm pointing to side prop */}
              <path
                d="M 124 140 Q 144 148 168 142"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="170" cy="142" r="5.5" fill="url(#skinGrad)" />
            </>
          )}

          {pose === 'holding-pad' && (
            <>
              {/* Left arm holding pad */}
              <path
                d="M 76 140 Q 78 164 96 166"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Right arm holding pad */}
              <path
                d="M 124 140 Q 120 164 104 166"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Sanitary Pad Prop in Hands */}
              <g transform="translate(86, 154) scale(0.9)" filter="url(#subtleClayShadow)">
                <rect x="0" y="4" width="28" height="16" rx="8" fill="url(#padGrad)" stroke="#C98A6B" strokeWidth="1" />
                <path d="M 6 12 L 22 12" stroke="#B37557" strokeWidth="1.2" strokeDasharray="2 2" />
                <rect x="9" y="1" width="10" height="22" rx="3" fill="#FFFFFF" opacity="0.85" stroke="#C98A6B" strokeWidth="0.8" />
              </g>
            </>
          )}

          {pose === 'explaining' && (
            <>
              {/* Left arm open gesture */}
              <path
                d="M 76 140 Q 60 152 56 164"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="54" cy="166" r="5.5" fill="url(#skinGrad)" />

              {/* Right arm open gesture */}
              <path
                d="M 124 140 Q 142 150 148 162"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="150" cy="164" r="5.5" fill="url(#skinGrad)" />
            </>
          )}

          {pose === 'thinking' && (
            <>
              {/* Left arm on waist */}
              <path
                d="M 76 140 Q 62 152 70 166"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Right arm to chin */}
              <path
                d="M 124 140 Q 134 130 114 114"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="112" cy="112" r="5.5" fill="url(#skinGrad)" />
            </>
          )}

          {pose === 'resting' && (
            <>
              {/* Hands placed gently on tummy */}
              <path
                d="M 76 140 Q 82 168 94 170"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 124 140 Q 118 168 106 170"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </>
          )}

          {pose === 'washroom-prep' && (
            <>
              {/* Holding small pouch/kit */}
              <path
                d="M 76 140 Q 72 162 88 168"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 124 140 Q 116 160 106 168"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Cute kit pouch */}
              <rect x="90" y="160" width="20" height="16" rx="4" fill="var(--bloom-sage, #8FAE9B)" stroke="#5E8F8B" strokeWidth="1" />
            </>
          )}

          {pose === 'breathing' && (
            <>
              {/* Hands on upper chest, calm deep breath */}
              <path
                d="M 76 140 Q 86 150 96 154"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 124 140 Q 114 150 104 154"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </>
          )}

          {pose === 'calm' && (
            <>
              {/* Both arms calmly by side */}
              <path
                d="M 76 140 Q 68 158 72 176"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="72" cy="178" r="5.5" fill="url(#skinGrad)" />

              <path
                d="M 124 140 Q 132 158 128 176"
                stroke="url(#skinGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="128" cy="178" r="5.5" fill="url(#skinGrad)" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
