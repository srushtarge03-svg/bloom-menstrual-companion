import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Heart, Calendar } from 'lucide-react';

export type TabType = 'home' | 'learn' | 'prepare' | 'cycle';

export interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useTranslation();

  const tabs: { key: TabType; labelKey: string; icon: React.FC<{ size: number }> }[] = [
    { key: 'home', labelKey: 'nav.home', icon: Home },
    { key: 'learn', labelKey: 'nav.before', icon: BookOpen },
    { key: 'prepare', labelKey: 'nav.firstPeriod', icon: Heart },
    { key: 'cycle', labelKey: 'nav.cycle', icon: Calendar },
  ];

  return (
    <nav className="w-full bg-bloom-card/90 dark:bg-bloom-darkCard/90 backdrop-blur-md border-t border-bloom-line dark:border-bloom-darkLine py-2 px-3 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-full ${
              isActive
                ? 'text-bloom-primary dark:text-bloom-darkPrimary font-bold'
                : 'text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-ink dark:hover:text-bloom-darkInk font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-transform ${
                isActive
                  ? 'bg-bloom-pressed dark:bg-bloom-darkPressed scale-105 shadow-sm'
                  : ''
              }`}
            >
              <Icon size={20} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
