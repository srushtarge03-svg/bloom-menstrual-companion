import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Play } from 'lucide-react';

export interface PrepareViewProps {
  completedLessons: Record<string, number>;
  onSelectTopic: (topicKey: string) => void;
}

export const PrepareView: React.FC<PrepareViewProps> = ({
  completedLessons,
  onSelectTopic,
}) => {
  const { t } = useTranslation();

  const topicKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-bloom-ink dark:text-bloom-darkInk">
          {t('prepare.title')}
        </h2>
        <p className="text-xs sm:text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
          {t('prepare.subtitle')}
        </p>
      </div>

      {/* Medical Review Notice Banner per specification */}
      <div className="p-3.5 rounded-[18px] bg-bloom-gold/15 dark:bg-bloom-darkGold/15 border border-bloom-gold/40 dark:border-bloom-darkGold/30 flex items-start gap-2.5 text-xs text-bloom-ink dark:text-bloom-darkInk">
        <AlertCircle size={18} className="text-bloom-gold flex-shrink-0 mt-0.5" />
        <span className="font-medium leading-relaxed">
          {t('prepare.needsReviewBanner')}
        </span>
      </div>

      {/* Topics List */}
      <div className="space-y-3 pt-1">
        {topicKeys.map((k, index) => {
          const isDone = Boolean(completedLessons[k]);
          const topicTitle = t(`prepare.topics.${k}.title`);
          const topicDesc = t(`prepare.topics.${k}.description`);
          const needsMedicalReview = index >= 2;

          return (
            <button
              key={k}
              onClick={() => onSelectTopic(k)}
              className="w-full text-left clay-card p-4 sm:p-5 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine flex items-start gap-3.5 active:scale-[0.98] transition-all hover:border-bloom-teal"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${
                  isDone
                    ? 'bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage'
                    : 'bg-bloom-teal/15 text-bloom-teal dark:bg-bloom-darkTeal/20 dark:text-bloom-darkTeal'
                }`}
              >
                {isDone ? <CheckCircle2 size={22} /> : <span>{index + 1}</span>}
              </div>

              {/* Title, description, pill */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-bloom-teal dark:text-bloom-darkTeal">
                    Topic {index + 1}
                  </span>
                  {needsMedicalReview && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bloom-gold/20 text-bloom-ink dark:text-bloom-darkInk">
                      Needs Medical Review
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-bloom-ink dark:text-bloom-darkInk leading-tight">
                  {topicTitle}
                </h3>

                <p className="text-xs text-bloom-mute dark:text-bloom-darkMute line-clamp-2 leading-relaxed">
                  {topicDesc}
                </p>

                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDone
                        ? 'bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage'
                        : 'bg-bloom-pressed text-bloom-teal dark:bg-bloom-darkPressed dark:text-bloom-darkTeal'
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
