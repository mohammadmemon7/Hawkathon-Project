import React from 'react';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ language, toggleLanguage }) {
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-teal-700 hover:bg-white transition-all duration-300 border border-teal-100 shadow-xl shadow-teal-900/5 group active:scale-95"
    >
      <Languages size={15} className="group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-[10px] font-black tracking-widest uppercase">
        {language === 'hi' ? 'English' : 'हिंदी'}
      </span>
      <div className="w-5 h-5 rounded-full bg-teal-600 text-[8px] flex items-center justify-center text-white font-black shadow-inner">
        {language === 'hi' ? 'EN' : 'HI'}
      </div>
    </button>
  );
}
