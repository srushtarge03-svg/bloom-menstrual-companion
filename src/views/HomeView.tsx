import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Heart, Calendar } from 'lucide-react';
import { TabType } from '../components/BottomNav';
import { BloomGirl } from '../components/BloomGirl';

export interface HomeViewProps {
  completedLessonsCount: number;
  totalLessonsCount: number;
  onNavigate: (tab: TabType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  completedLessonsCount,
  totalLessonsCount,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const progressPercent = Math.min(
    100,
    Math.round((completedLessonsCount / Math.max(1, totalLessonsCount)) * 100)
  );

  const tiles = [
    {
      num: '1',
      tab: 'learn' as TabType,
      title: t('home.tile1Title'),
      desc: t('home.tile1Desc'),
      tags: t('home.tile1Tags', { returnObjects: true }) as string[],
      icon: BookOpen,
      gradient: 'from-[#FF6F61] via-[#FF8A65] to-[#FFA770]',
      shadowColor: 'shadow-[0_14px_30px_rgba(255,111,97,0.38)]',
    },
    {
      num: '2',
      tab: 'prepare' as TabType,
      title: t('home.tile2Title'),
      desc: t('home.tile2Desc'),
      tags: t('home.tile2Tags', { returnObjects: true }) as string[],
      icon: Heart,
      gradient: 'from-[#0D9488] via-[#14B8A6] to-[#2DD4BF]',
      shadowColor: 'shadow-[0_14px_30px_rgba(20,184,166,0.38)]',
    },
    {
      num: '3',
      tab: 'cycle' as TabType,
      title: t('home.tile3Title'),
      desc: t('home.tile3Desc'),
      tags: t('home.tile3Tags', { returnObjects: true }) as string[],
      icon: Calendar,
      gradient: 'from-[#7C3AED] via-[#9333EA] to-[#C026D3]',
      shadowColor: 'shadow-[0_14px_30px_rgba(147,51,234,0.38)]',
    },
  ];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Hero Welcome Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-bloom-ink dark:text-bloom-darkInk tracking-tight">
          {t('home.welcome')}
        </h1>
        <p className="text-xs sm:text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
          {t('app.tagline')}
        </p>
      </div>

      {/* Maya Companion Hero Card */}
      <div className="clay-card p-4 rounded-[22px] bg-gradient-to-br from-white to-pink-50/40 dark:from-bloom-darkCard dark:to-bloom-darkPressed shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine flex items-center gap-3.5">
        <div className="w-[72px] h-[72px] rounded-2xl bg-bloom-pressed dark:bg-bloom-darkPressed flex items-center justify-center flex-shrink-0 shadow-sm border border-bloom-line/50 overflow-hidden">
          <BloomGirl pose="waving" expression="happy" size={68} />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bloom-primary/10 text-bloom-primary dark:text-bloom-darkPrimary text-[11px] font-bold">
            <span>FRIENDLY COMPANION</span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-bloom-ink dark:text-bloom-darkInk">
            Maya is here with you!
          </h3>
          <p className="text-[11px] sm:text-xs text-bloom-mute dark:text-bloom-darkMute font-medium leading-relaxed">
            Your safe, private space to learn, track and ask questions anytime.
          </p>
        </div>
      </div>

      {/* Learning Journey Progress Card */}
      <div className="clay-card p-4 sm:p-5 rounded-[22px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-bloom-ink dark:text-bloom-darkInk">
            {t('home.progressTitle')}
          </span>
          <span className="text-bloom-primary dark:text-bloom-darkPrimary font-bold">
            {t('home.lessonsCompleted', {
              completed: completedLessonsCount,
              total: totalLessonsCount,
            })}
          </span>
        </div>

        {/* Pressed-in Progress Bar */}
        <div className="w-full h-3 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed shadow-inner overflow-hidden p-0.5 border border-bloom-line/60 dark:border-bloom-darkLine">
          <div
            className="h-full rounded-full bg-bloom-primary dark:bg-bloom-darkPrimary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Large Numbered Gradient Tiles */}
      <div className="space-y-4 pt-1">
        {tiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <button
              key={tile.num}
              onClick={() => onNavigate(tile.tab)}
              className={`w-full text-left relative overflow-hidden rounded-[22px] p-5 sm:p-6 bg-gradient-to-br ${tile.gradient} text-white shadow-md active:scale-[0.98] transition-all duration-200 group`}
            >
              {/* Giant background subtle number */}
              <span className="absolute -right-2 -top-4 text-7xl sm:text-8xl font-black opacity-20 pointer-events-none select-none">
                {tile.num}
              </span>

              {/* Decorative subtle light circle */}
              <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative z-10 space-y-3">
                {/* Tile Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
                  <Icon size={20} />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                    {tile.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed mt-1 max-w-[85%]">
                    {tile.desc}
                  </p>
                </div>

                {/* Tags / Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tile.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-sm text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
