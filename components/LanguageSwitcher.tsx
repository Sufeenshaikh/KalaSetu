import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' }, // Hindi
  { code: 'ta', name: 'தமிழ்' },   // Tamil
  { code: 'mr', name: 'मराठी' }    // Marathi
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'ta' | 'mr')}
        className="appearance-none bg-transparent border border-text-secondary text-text-primary rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select language"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-surface text-text-primary">
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;