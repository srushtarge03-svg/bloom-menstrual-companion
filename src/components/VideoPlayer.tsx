import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { SceneIllustration } from './SceneIllustrations';
import { STORYBOARDS, StoryboardScene } from '../data/storyboards';
import { audioService } from '../utils/audioService';

export interface SceneData {
  title: string;
  text: string;
}

export interface VideoPlayerProps {
  videoId: string;
  scenes?: SceneData[];
  onStartQuiz: () => void;
  onBack: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onStartQuiz,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (['en', 'hi', 'mr'].includes(i18n.language) ? i18n.language : 'en') as 'en' | 'hi' | 'mr';

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve rich storyboard data for the active video
  const lessonStoryboard = STORYBOARDS[videoId];
  const storyboardScenes: StoryboardScene[] = lessonStoryboard ? lessonStoryboard.scenes : [
    {
      id: `${videoId}-0`,
      duration: 6,
      girl: { pose: 'explaining', expression: 'happy', look: 'center' },
      propType: 'growth-chart-diagram',
      keywords: { en: ['Growing Well'], hi: ['अच्छा विकास'], mr: ['छान वाढ'] },
      labels: { en: ['Growth'], hi: ['विकास'], mr: ['वाढ'] },
      title: { en: 'Welcome', hi: 'नमस्ते', mr: 'स्वागत' },
      narration: { en: 'Welcome to this lesson.', hi: 'इस पाठ में आपका स्वागत है।', mr: 'या धड्यात आपले स्वागत आहे.' },
    },
  ];

  const currentScene = storyboardScenes[currentSceneIndex] || storyboardScenes[0];

  // Advance to next scene or end video
  const advanceToNextScene = () => {
    if (currentSceneIndex < storyboardScenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setProgressPercent(0);
    } else {
      setVideoEnded(true);
      setIsPlaying(false);
      setIsSpeaking(false);
      setProgressPercent(100);
    }
  };

  // Play narration audio for current scene
  useEffect(() => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (!isPlaying) {
      audioService.pause();
      setIsSpeaking(false);
      return;
    }

    if (videoEnded) {
      audioService.stopAll();
      setIsSpeaking(false);
      return;
    }

    setProgressPercent(0);
    const sceneDurationMs = (currentScene.duration || 6.5) * 1000;
    const intervalMs = 100;
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += intervalMs;
      setProgressPercent(Math.min(100, (elapsed / sceneDurationMs) * 100));
    }, intervalMs);

    const narrationText = currentScene.narration[currentLang] || currentScene.narration.en;

    if (!isMuted) {
      setIsSpeaking(true);
      audioService.playSceneNarration({
        videoId,
        sceneIndex: currentSceneIndex,
        language: currentLang,
        textToSpeak: narrationText,
        onStarted: () => {
          setIsSpeaking(true);
          setAutoplayBlocked(false);
        },
        onEnded: () => {
          setIsSpeaking(false);
          // 1.2s comfortable pause so learner can absorb the scene before advancing
          if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = setTimeout(() => {
            advanceToNextScene();
          }, 1200);
        },
        onAutoplayBlocked: () => {
          setAutoplayBlocked(true);
          setIsSpeaking(false);
        },
      });
    } else {
      setIsSpeaking(false);
      // Silent mode auto-advancement
      fallbackTimerRef.current = setTimeout(() => {
        advanceToNextScene();
      }, sceneDurationMs);
    }

    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      audioService.stopAll();
    };
  }, [currentSceneIndex, isPlaying, isMuted, videoId, currentLang]);

  const togglePlayPause = () => {
    audioService.unlockAudio();
    if (autoplayBlocked) {
      setAutoplayBlocked(false);
    }
    if (videoEnded) {
      setCurrentSceneIndex(0);
      setVideoEnded(false);
      setIsPlaying(true);
      setProgressPercent(0);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleSound = () => {
    audioService.unlockAudio();
    setIsMuted(!isMuted);
  };

  const handleReplay = () => {
    audioService.unlockAudio();
    setAutoplayBlocked(false);
    setCurrentSceneIndex(0);
    setVideoEnded(false);
    setIsPlaying(true);
    setProgressPercent(0);
  };

  const jumpToScene = (idx: number) => {
    audioService.unlockAudio();
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setAutoplayBlocked(false);
    setCurrentSceneIndex(idx);
    setVideoEnded(false);
    setIsPlaying(true);
    setProgressPercent(0);
  };

  const handlePrevScene = () => {
    audioService.unlockAudio();
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setVideoEnded(false);
      setProgressPercent(0);
      setIsPlaying(true);
    }
  };

  const handleNextScene = () => {
    audioService.unlockAudio();
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (currentSceneIndex < storyboardScenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setVideoEnded(false);
      setProgressPercent(0);
      setIsPlaying(true);
    } else {
      setVideoEnded(true);
      setIsPlaying(false);
      setIsSpeaking(false);
      setProgressPercent(100);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top back button */}
      <button
        onClick={onBack}
        className="self-start text-sm font-semibold text-bloom-primary dark:text-bloom-darkPrimary hover:underline flex items-center gap-1 active:scale-95 transition-transform"
      >
        <ArrowLeft size={16} /> {t('quiz.backToLesson')}
      </button>

      {/* Main Video Box with Claymorphism */}
      <div className="relative clay-card p-3 sm:p-4 rounded-[22px] overflow-hidden bg-bloom-card dark:bg-bloom-darkCard shadow-clay dark:shadow-clay-dark border border-bloom-line/70 dark:border-bloom-darkLine">
        {/* Autoplay Blocked Banner */}
        {autoplayBlocked && (
          <div className="absolute inset-x-3 top-14 z-30 flex items-center justify-center p-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                audioService.unlockAudio();
                setAutoplayBlocked(false);
                setIsPlaying(true);
                const narrationText = currentScene.narration[currentLang] || currentScene.narration.en;
                if (!isMuted) {
                  setIsSpeaking(true);
                  audioService.playSceneNarration({
                    videoId,
                    sceneIndex: currentSceneIndex,
                    language: currentLang,
                    textToSpeak: narrationText,
                    onStarted: () => {
                      setIsSpeaking(true);
                      setAutoplayBlocked(false);
                    },
                    onEnded: () => {
                      setIsSpeaking(false);
                      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
                      fallbackTimerRef.current = setTimeout(() => {
                        advanceToNextScene();
                      }, 1200);
                    },
                    onAutoplayBlocked: () => setAutoplayBlocked(true),
                  });
                }
              }}
              className="px-4 py-2.5 rounded-full bg-bloom-primary text-white shadow-clay flex items-center gap-2 text-xs sm:text-sm font-bold hover:opacity-95 active:scale-95 transition-all"
              aria-label={t('player.tapToPlaySound')}
            >
              <Volume2 size={18} className="animate-pulse" />
              <span>{t('player.tapToPlaySound')}</span>
            </button>
          </div>
        )}

        {/* Segmented Progress Bar */}
        <div className="flex gap-2 mb-3 px-1">
          {storyboardScenes.map((_, idx) => {
            let fillWidth = '0%';
            if (idx < currentSceneIndex || videoEnded) {
              fillWidth = '100%';
            } else if (idx === currentSceneIndex) {
              fillWidth = `${progressPercent}%`;
            }

            return (
              <button
                key={idx}
                onClick={() => jumpToScene(idx)}
                aria-label={`Jump to scene ${idx + 1}`}
                className="flex-1 h-2 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed overflow-hidden cursor-pointer relative border border-bloom-line/50 dark:border-bloom-darkLine"
              >
                <div
                  className="h-full bg-bloom-primary dark:bg-bloom-darkPrimary transition-all duration-100 rounded-full"
                  style={{ width: fillWidth }}
                />
              </button>
            );
          })}
        </div>

        {/* Rigged 2D Character & Explanatory Teaching Scene */}
        <SceneIllustration
          scene={currentScene}
          speaking={isSpeaking}
          paused={!isPlaying}
          lang={currentLang}
        />

        {/* Captions / Narrative Text */}
        <div className="mt-4 px-2 py-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-primary dark:text-bloom-darkPrimary bg-bloom-pressed dark:bg-bloom-darkPressed px-2.5 py-0.5 rounded-full border border-bloom-line/60 dark:border-bloom-darkLine">
                {currentSceneIndex + 1} / {storyboardScenes.length}
              </span>
              <h3 className="text-lg font-bold text-bloom-ink dark:text-bloom-darkInk">
                {currentScene.title[currentLang] || currentScene.title.en}
              </h3>
            </div>

            {/* Speaking Voice Indicator */}
            {isSpeaking && !isMuted && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bloom-primary/10 dark:bg-bloom-primary/20 text-bloom-primary dark:text-bloom-darkPrimary text-xs font-semibold"
                aria-label={t('player.speaking')}
                title={t('player.speaking')}
              >
                <Volume2 size={13} className="animate-pulse" />
                <span className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-bloom-primary dark:bg-bloom-darkPrimary rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-bloom-primary dark:bg-bloom-darkPrimary rounded-full animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-bloom-primary dark:bg-bloom-darkPrimary rounded-full animate-pulse" />
                </span>
                <span className="text-[11px] font-medium hidden xs:inline">
                  {t('player.speaking')}
                </span>
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-bloom-ink/90 dark:text-bloom-darkInk/90 leading-relaxed font-medium">
            {currentScene.narration[currentLang] || currentScene.narration.en}
          </p>
        </div>
      </div>

      {/* Playback Controls & Action Bar */}
      <div className="flex items-center gap-2 pt-1">
        {/* Previous Scene Button */}
        <button
          onClick={handlePrevScene}
          disabled={currentSceneIndex === 0}
          aria-label="Previous Scene"
          title="Previous Scene"
          className="w-10 h-10 rounded-full clay-btn flex items-center justify-center bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk active:scale-95 transition-transform border border-bloom-line/60 dark:border-bloom-darkLine disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          aria-label={isPlaying && !videoEnded ? t('player.pause') : t('player.play')}
          className="w-11 h-11 rounded-full clay-btn flex items-center justify-center bg-bloom-card dark:bg-bloom-darkCard text-bloom-primary dark:text-bloom-darkPrimary active:scale-95 transition-transform border border-bloom-line/60 dark:border-bloom-darkLine"
        >
          {isPlaying && !videoEnded ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Next Scene Button */}
        <button
          onClick={handleNextScene}
          aria-label="Next Scene"
          title="Next Scene"
          className="w-10 h-10 rounded-full clay-btn flex items-center justify-center bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk active:scale-95 transition-transform border border-bloom-line/60 dark:border-bloom-darkLine"
        >
          <ChevronRight size={18} />
        </button>

        {/* Sound Toggle (Girl Voice Only) */}
        <button
          onClick={toggleSound}
          aria-label={isMuted ? t('player.soundOn') : t('player.soundOff')}
          title={isMuted ? t('player.soundOn') : t('player.soundOff')}
          className={`w-10 h-10 rounded-full clay-btn flex items-center justify-center active:scale-95 transition-transform border border-bloom-line/60 dark:border-bloom-darkLine ${
            !isMuted ? 'bg-bloom-primary/15 text-bloom-primary dark:text-bloom-darkPrimary' : 'bg-bloom-card dark:bg-bloom-darkCard text-bloom-mute'
          }`}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          aria-label={t('player.replay')}
          title={t('player.replay')}
          className="w-10 h-10 rounded-full clay-btn flex items-center justify-center bg-bloom-card dark:bg-bloom-darkCard text-bloom-ink dark:text-bloom-darkInk active:scale-95 transition-transform border border-bloom-line/60 dark:border-bloom-darkLine"
        >
          <RotateCcw size={17} />
        </button>

        {/* Start Quiz Button */}
        <button
          onClick={onStartQuiz}
          className={`flex-1 h-11 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm ${
            videoEnded
              ? 'btn-primary shadow-clay'
              : 'bg-bloom-primary text-white hover:bg-bloom-primary/90'
          }`}
        >
          <span>{t('player.startQuiz')}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Young Girl Narration Audio Notice */}
      <p className="text-[11px] text-center text-bloom-mute dark:text-bloom-darkMute">
        {t('player.ttsNotice')}
      </p>
    </div>
  );
};
