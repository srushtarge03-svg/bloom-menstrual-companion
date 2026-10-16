import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface QuizModalProps {
  videoId: string;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onRetryVideo: () => void;
  onBack: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  questions,
  onComplete,
  onRetryVideo,
  onBack,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === currentQ.answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
      onComplete(score + (selectedAnswer === currentQ.answerIndex ? 1 : 0));
    }
  };

  if (isFinished) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6 px-4 space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-bloom-sage/20 text-bloom-sage dark:text-bloom-darkSage flex items-center justify-center shadow-clay">
          <Award size={36} />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-bloom-ink dark:text-bloom-darkInk">
            {t('quiz.quizDone')}
          </h2>
          <p className="text-sm text-bloom-mute dark:text-bloom-darkMute font-medium">
            {t('quiz.yourScore')}: <span className="text-bloom-primary dark:text-bloom-darkPrimary font-bold text-lg">{score}</span> / {questions.length}
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            onClick={onBack}
            className="w-full h-12 py-3 rounded-full font-bold text-white btn-primary flex items-center justify-center gap-2"
          >
            {t('quiz.backToLesson')}
          </button>
          <button
            onClick={onRetryVideo}
            className="w-full h-12 py-3 rounded-full font-bold text-bloom-primary dark:text-bloom-darkPrimary bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            {t('quiz.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start text-sm font-semibold text-bloom-primary dark:text-bloom-darkPrimary hover:underline flex items-center gap-1 active:scale-95 transition-transform"
      >
        <ArrowLeft size={16} /> {t('quiz.backToLesson')}
      </button>

      {/* Progress pill */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-bloom-mute dark:text-bloom-darkMute">
          {t('quiz.questionOf', { current: currentIndex + 1, total: questions.length })}
        </span>
        <span className="text-xs font-bold text-bloom-primary dark:text-bloom-darkPrimary">
          Score: {score}
        </span>
      </div>

      {/* Question Card */}
      <div className="clay-card p-5 rounded-[20px] bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-bloom-ink dark:text-bloom-darkInk leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          {currentQ.options.map((option, idx) => {
            let optionStyles = 'bg-bloom-bg dark:bg-bloom-darkBg text-bloom-ink dark:text-bloom-darkInk border-bloom-line/80 dark:border-bloom-darkLine hover:border-bloom-primary';

            if (selectedAnswer !== null) {
              if (idx === currentQ.answerIndex) {
                optionStyles = 'bg-bloom-sage/20 text-bloom-ink dark:text-bloom-darkInk border-bloom-sage font-bold';
              } else if (idx === selectedAnswer) {
                optionStyles = 'bg-bloom-rose/20 text-bloom-ink dark:text-bloom-darkInk border-bloom-rose font-bold';
              } else {
                optionStyles = 'opacity-50 border-transparent';
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-[16px] border-2 transition-all flex items-center justify-between text-xs sm:text-sm ${optionStyles}`}
              >
                <span>{option}</span>
                {selectedAnswer !== null && idx === currentQ.answerIndex && (
                  <CheckCircle2 size={18} className="text-bloom-sage flex-shrink-0 ml-2" />
                )}
                {selectedAnswer !== null && idx === selectedAnswer && idx !== currentQ.answerIndex && (
                  <XCircle size={18} className="text-bloom-rose flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Feedback Box */}
        {selectedAnswer !== null && (
          <div className="p-3.5 rounded-[16px] bg-bloom-pressed dark:bg-bloom-darkPressed text-xs sm:text-sm leading-relaxed border border-bloom-line/80 dark:border-bloom-darkLine">
            <span className="font-bold text-bloom-primary dark:text-bloom-darkPrimary block mb-1">
              {selectedAnswer === currentQ.answerIndex ? t('quiz.correct') : t('quiz.incorrect')}
            </span>
            <span className="text-bloom-ink/90 dark:text-bloom-darkInk/90 font-medium">
              {currentQ.explanation}
            </span>
          </div>
        )}
      </div>

      {/* Next Question Button */}
      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-full font-bold text-white btn-primary shadow-clay transition-all flex items-center justify-center gap-2"
        >
          <span>{t('quiz.nextQuestion')}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};
