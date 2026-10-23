import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

interface PreferencesContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  hideStreaks: boolean;
  setHideStreaks: (hide: boolean) => void;
  isOffline: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');
  const [hideStreaks, setHideStreaks] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        hideStreaks,
        setHideStreaks,
        isOffline,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}
