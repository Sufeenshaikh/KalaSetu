import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'mr';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// A small dictionary for demonstration
const translations: Translations = {
  home: { en: 'Home', hi: 'होम', ta: 'முகப்பு', mr: 'मुख्यपृष्ठ' },
  shop: { en: 'Shop', hi: 'दुकान', ta: 'கடை', mr: 'दुकान' },
  forArtisans: { en: 'For Artisans', hi: 'कारीगरों के लिए', ta: 'கைவினைஞர்களுக்காக', mr: 'हस्तकलाकारांसाठी' },
  aboutUs: { en: 'About Us', hi: 'हमारे बारे में', ta: 'எங்களைப் பற்றி', mr: 'आमच्याबद्दल' },
  myProfile: { en: 'My Profile', hi: 'मेरी प्रोफाइल', ta: 'என் சுயவிவரம்', mr: 'माझे प्रोफाइल' },
  discoverCrafts: { en: 'Discover Crafts', hi: 'शिल्प खोजें', ta: 'கைவினைப்பொருட்களைக் கண்டறியவும்', mr: 'हस्तकला शोधा' },
  featuredCrafts: { en: 'Featured Crafts', hi: 'विशेष रुप से प्रदर्शित शिल्प', ta: 'சிறப்பு கைவினைப்பொருட்கள்', mr: 'वैशिष्ट्यीकृत हस्तकला' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};