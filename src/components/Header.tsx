import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Shield, User } from 'lucide-react';

export interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPrivacy: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenPrivacy,
  onOpenLogin,
}) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'mr', label: 'मरा' },
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bloom_language', code);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 select-none">
      {/* App Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-bloom-primary flex items-center justify-center text-white shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Lotus Flower Petals */}
            <path d="M12 3c-1.8 3.8-1.8 8 0 14.5 1.8-6.5 1.8-10.7 0-14.5z" fill="currentColor" fillOpacity="0.3" />
            <path d="M12 17.5c-3.6-1.5-6.5-5-5.2-9.5 1.5 3.4 3.6 6.8 5.2 9.5z" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 17.5c3.6-1.5 6.5-5 5.2-9.5-1.5 3.4-3.6 6.8-5.2 9.5z" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 18.5c-4.6-.3-8-3-9-5.5 2.6.2 6.2 2.6 9 5.5z" fill="currentColor" fillOpacity="0.12" />
            <path d="M12 18.5c4.6-.3 8-3 9-5.5-2.6.2-6.2 2.6-9 5.5z" fill="currentColor" fillOpacity="0.12" />
            <path d="M9 20.5c1.8.6 4.2.6 6 0" strokeWidth="1.8" />
          </svg>
        </div>
        <span className="font-extrabold text-lg tracking-wider text-bloom-ink dark:text-bloom-darkInk">
          BLOOM
        </span>
      </div>

      {/* Right controls: Login + Privacy + Theme + Language Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Account / Login Icon */}
        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            aria-label="Account or Login"
            className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-primary transition-colors"
          >
            <User size={16} />
          </button>
        )}

        {/* Privacy Icon */}
        <button
          onClick={onOpenPrivacy}
          aria-label="Privacy settings"
          className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-primary transition-colors"
        >
          <Shield size={16} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-full flex items-center justify-center text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-primary transition-colors"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* 3-Language Switcher (Always visible per spec) */}
        <div className="flex items-center p-1 rounded-full bg-bloom-pressed dark:bg-bloom-darkPressed border border-bloom-line/70 dark:border-bloom-darkLine">
          {languages.map((l) => {
            const isSelected = i18n.language === l.code || (l.code === 'en' && !i18n.language);
            return (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-bloom-primary dark:bg-bloom-darkPrimary text-white dark:text-bloom-darkBg shadow-sm'
                    : 'text-bloom-mute dark:text-bloom-darkMute hover:text-bloom-ink dark:hover:text-bloom-darkInk'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
