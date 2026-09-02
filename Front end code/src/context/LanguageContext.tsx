import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { getTranslation, TranslationDictionary } from '../i18n';
import safeStorage, { StorageKeys } from '../services/storage';

interface LanguageContextType {
  language: LanguageCode;
  t: TranslationDictionary;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  speakText: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      const saved = await safeStorage.getItem(StorageKeys.LANGUAGE);
      if (saved && ['en', 'hi', 'ml', 'ta', 'te', 'mr', 'pa'].includes(saved)) {
        setLanguageState(saved as LanguageCode);
      }
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    await safeStorage.setItem(StorageKeys.LANGUAGE, newLang);
  };

  const speakText = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap: Record<LanguageCode, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          ml: 'ml-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          mr: 'mr-IN',
          pa: 'pa-IN',
        };
        utterance.lang = langMap[language] || 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Voice synthesis not available:', e);
    }
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, speakText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
