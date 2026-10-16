import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Play } from 'lucide-react';

export interface LearnViewProps {
  completedLessons: Record<string, number>;
  onSelectLevel: (levelKey: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  completedLessons,
  onSelectLevel,
}) => {
  const { t } = useTranslation();

  const levelKeys = ['l1', 'l2', 'l3', 'l4'];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-bloom-ink dark:text-bloom-darkInk">
          {t('learn.title')}
        </h2>
        <p className="text-xs sm:text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
          {t('learn.subtitle')}
        </p>
      </div>

      {/* Levels List */}
      <div className="space-y-3 pt-2">
        {levelKeys.map((k, index) => {
          const isDone = Boolean(completedLessons[k]);
          const levelTitle = t(`learn.levels.${k}.title`);
          const levelDesc = t(`learn.levels.${k}.description`);

          return (
            <button
              key={k}
              onClick={() => onSelectLevel(k)}
              className="w-full text-left clay-card p-4 sm:p-5 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine flex items-start gap-3.5 active:scale-[0.98] transition-all hover:border-bloom-primary"
            >
              {/* Icon avatar */}
              <div
                className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${
                  isDone
                    ? 'bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage'
                    : 'bg-bloom-pressed text-bloom-primary dark:bg-bloom-darkPressed dark:text-bloom-darkPrimary'
                }`}
              >
                {isDone ? <CheckCircle2 size={22} /> : <span>{index + 1}</span>}
              </div>

              {/* Title, description, pill */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-primary dark:text-bloom-darkPrimary">
                    {t('learn.level')} {index + 1}
                  </span>
                  {isDone && (
                    <span className="text-[11px] font-semibold text-bloom-sage dark:text-bloom-darkSage">
                      Score: {completedLessons[k]}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-bloom-ink dark:text-bloom-darkInk leading-tight">
                  {levelTitle}
                </h3>

                <p className="text-xs text-bloom-mute dark:text-bloom-darkMute line-clamp-2 leading-relaxed">
                  {levelDesc}
                </p>

                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDone
                        ? 'bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage'
                        : 'bg-bloom-pressed text-bloom-primary dark:bg-bloom-darkPressed dark:text-bloom-darkPrimary'
                    }`}
                  >
                    {isDone ? (
                      t('learn.completed')
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" /> {t('learn.watchVideo')}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
