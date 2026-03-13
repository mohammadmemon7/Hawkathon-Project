import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ language, toggleLanguage }) {
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-100 shadow-sm group"
    >
      <Languages size={14} className="group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-bold tracking-wider uppercase">
        {language === 'hi' ? 'English' : 'हिंदी'}
      </span>
      <span className="w-4 h-4 rounded-full bg-teal-600 text-[8px] flex items-center justify-center text-white font-black">
        {language === 'hi' ? 'EN' : 'HI'}
      </span>
    </button>
  );
}
