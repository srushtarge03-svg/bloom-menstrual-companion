import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { PrepareView } from './views/PrepareView';
import { CycleView } from './views/CycleView';
import { PrivacyView } from './views/PrivacyView';
import { LoginView } from './views/LoginView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { VideoPlayer } from './components/VideoPlayer';
import { QuizModal } from './components/QuizModal';
import { CycleLogModal } from './components/CycleLogModal';
import { ConsentModal } from './components/ConsentModal';
import { CycleRecord, analyzeCycles, CycleAnalysis } from './utils/cycleMath';
import { storage } from './utils/storage';

export const App: React.FC = () => {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(
    typeof window !== 'undefined' && window.location.pathname === '/diagnostics'
  );
  const [darkMode, setDarkMode] = useState(false);

  // Lesson playback state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeLessonStep, setActiveLessonStep] = useState<'video' | 'quiz'>('video');

  // Cycles & Lesson progress state
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number>>({});
  const [isCycleLogModalOpen, setIsCycleLogModalOpen] = useState(false);
  const [editingCycleRecord, setEditingCycleRecord] = useState<CycleRecord | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Initialize theme, consent and data
  useEffect(() => {
    // Check dark mode preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }

    // Check parental consent
    if (!storage.hasParentalConsent()) {
      setIsConsentModalOpen(true);
    }

    // Handle history popstate for /diagnostics
    const handlePopState = () => {
      setIsDiagnosticsOpen(window.location.pathname === '/diagnostics');
    };
    window.addEventListener('popstate', handlePopState);

    // Load cycles and lesson progress
    storage.getCycles().then(setCycles);
    storage.getLessonProgress().then(setCompletedLessons);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Analyze cycles with pure TypeScript math
  const analysis: CycleAnalysis | null = analyzeCycles(cycles);

  // Handle saving new or updated cycle
  const handleSaveCycle = async (record: CycleRecord) => {
    await storage.saveCycle(record);
    const updated = await storage.getCycles();
    setCycles(updated);
    setEditingCycleRecord(null);
  };

  // Handle lesson completion
  const handleLessonComplete = async (score: number) => {
    if (!activeVideoId) return;
    await storage.completeLesson(activeVideoId, score);
    const updated = await storage.getLessonProgress();
    setCompletedLessons(updated);
  };

  const getActiveLessonContent = () => {
    if (!activeVideoId) return null;

    const isLearn = activeVideoId.startsWith('l');
    const path = isLearn ? `learn.levels.${activeVideoId}` : `prepare.topics.${activeVideoId}`;

    const scenes = (t(`${path}.scenes`, { returnObjects: true }) as any[]) || [];
    const quiz = (t(`${path}.quiz`, { returnObjects: true }) as any[]) || [];

    return { scenes, quiz };
  };

  const activeLessonContent = getActiveLessonContent();

  const handleSelectLesson = (videoId: string) => {
    setActiveVideoId(videoId);
    setActiveLessonStep('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromLesson = () => {
    setActiveVideoId(null);
    setActiveLessonStep('video');
  };

  const openDiagnostics = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/diagnostics');
    }
    setIsLoginOpen(false);
    setIsPrivacyOpen(false);
    setIsDiagnosticsOpen(true);
  };

  const closeDiagnostics = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/diagnostics') {
      window.history.pushState({}, '', '/');
    }
    setIsDiagnosticsOpen(false);
  };

  const totalLessonsCount = 11; // 4 Learn levels + 7 Prepare topics
  const completedLessonsCount = Object.keys(completedLessons).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EDF9] via-[#FFF8F4] to-[#EFF9F6] dark:from-[#140E1B] dark:via-[#1D1426] dark:to-[#241731] flex items-center justify-center p-0 sm:p-4 selection:bg-bloom-primary selection:text-white">
      {/* Phone Frame Container */}
      <div id="phone" className="w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:max-h-[92vh] sm:rounded-[28px] bg-bloom-bg dark:bg-bloom-darkBg shadow-clay dark:shadow-clay-dark sm:border border-bloom-line dark:border-bloom-darkLine flex flex-col relative overflow-hidden">
        {/* App Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenPrivacy={() => {
            setIsLoginOpen(false);
            setIsDiagnosticsOpen(false);
            setIsPrivacyOpen(true);
          }}
          onOpenLogin={() => {
            setIsPrivacyOpen(false);
            setIsDiagnosticsOpen(false);
            setIsLoginOpen(true);
          }}
        />

        {/* Main Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-3 pb-8">
          {isDiagnosticsOpen ? (
            /* Mic & Audio Diagnostics View */
            <DiagnosticsView onBack={closeDiagnostics} />
          ) : activeVideoId && activeLessonContent ? (
            activeLessonStep === 'video' ? (
              <VideoPlayer
                videoId={activeVideoId}
                scenes={activeLessonContent.scenes}
                onStartQuiz={() => setActiveLessonStep('quiz')}
                onBack={handleBackFromLesson}
              />
            ) : (
              <QuizModal
                videoId={activeVideoId}
                questions={activeLessonContent.quiz}
                onComplete={(score) => handleLessonComplete(score)}
                onRetryVideo={() => setActiveLessonStep('video')}
                onBack={handleBackFromLesson}
              />
            )
          ) : isLoginOpen ? (
            /* Voice-Enabled Login / Sign-up View */
            <LoginView
              onSuccess={() => {
                setIsLoginOpen(false);
                storage.getCycles().then(setCycles);
                storage.getLessonProgress().then(setCompletedLessons);
              }}
              onContinueGuest={() => setIsLoginOpen(false)}
              onOpenDiagnostics={openDiagnostics}
            />
          ) : isPrivacyOpen ? (
            /* Privacy View */
            <PrivacyView
              onBack={() => setIsPrivacyOpen(false)}
              onDataDeleted={() => {
                setCycles([]);
                setCompletedLessons({});
                setIsPrivacyOpen(false);
              }}
            />
          ) : currentTab === 'home' ? (
            <HomeView
              completedLessonsCount={completedLessonsCount}
              totalLessonsCount={totalLessonsCount}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : currentTab === 'learn' ? (
            <LearnView
              completedLessons={completedLessons}
              onSelectLevel={handleSelectLesson}
            />
          ) : currentTab === 'prepare' ? (
            <PrepareView
              completedLessons={completedLessons}
              onSelectTopic={handleSelectLesson}
            />
          ) : (
            <CycleView
              analysis={analysis}
              onSaveCycle={handleSaveCycle}
              onOpenLogModal={() => {
                setEditingCycleRecord(null);
                setIsCycleLogModalOpen(true);
              }}
              onOpenDiagnostics={openDiagnostics}
            />
          )}
        </main>

        {/* Bottom Tab Bar (Visible when not actively inside video/quiz) */}
        {!activeVideoId && (
          <BottomNav
            currentTab={isPrivacyOpen || isLoginOpen || isDiagnosticsOpen ? 'home' : currentTab}
            onSelectTab={(tab) => {
              setIsPrivacyOpen(false);
              setIsLoginOpen(false);
              setIsDiagnosticsOpen(false);
              setCurrentTab(tab);
            }}
          />
        )}

        {/* Cycle Log Modal (Controlled with editing support) */}
        <CycleLogModal
          isOpen={isCycleLogModalOpen}
          initialRecord={editingCycleRecord}
          onClose={() => {
            setIsCycleLogModalOpen(false);
            setEditingCycleRecord(null);
          }}
          onSave={handleSaveCycle}
        />

        {/* DPDP Parental Consent Modal */}
        <ConsentModal
          isOpen={isConsentModalOpen}
          onConsent={() => setIsConsentModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
