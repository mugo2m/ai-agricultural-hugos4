"use client";

import { useTranslation } from 'react-i18next';
import { Sprout } from "lucide-react";
import { LANGUAGE_OPTIONS } from '@/lib/config/language';

interface LanguageBarProps {
  className?: string;
}

const LanguageBar = ({ className = '' }: LanguageBarProps) => {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Optional: Save to localStorage for persistence
    localStorage.setItem('preferred-language', langCode);
  };

  const getButtonStyle = (langCode: string) => {
    const isActive = i18n.language.startsWith(langCode);

    if (isActive) {
      return "bg-green-600 text-white border-2 border-white shadow-lg scale-105";
    }
    return "bg-white text-green-800 hover:bg-green-100 border-2 border-green-600";
  };

  return (
    <div className={`w-full bg-gradient-to-r from-green-700 to-green-800 text-white py-3 px-4 md:px-6 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <Sprout className="w-6 h-6 text-green-200" />
          <span className="text-xl font-bold text-white">AgriMultimodal</span>
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full ml-2 hidden sm:inline-block">
            Beta
          </span>
        </div>

        {/* Language Buttons - Large and Obvious */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                ${getButtonStyle(lang.code)}
                px-4 md:px-6 py-2.5 md:py-3
                rounded-xl font-bold text-sm md:text-base
                transition-all duration-200
                flex items-center gap-2
                min-w-[120px] md:min-w-[140px] justify-center
                hover:scale-105 active:scale-95
              `}
              aria-label={`Switch to ${lang.name}`}
            >
              <span className="text-lg md:text-xl">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Hint - Optional */}
        <div className="text-xs text-green-200 md:hidden">
          Tap to change language
        </div>
      </div>
    </div>
  );
};

export default LanguageBar;