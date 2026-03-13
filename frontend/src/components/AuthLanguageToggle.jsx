import React, { useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const LANG_OPTIONS = [
  { code: 'hi', label: 'हिं', full: 'हिंदी' },
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'pa', label: 'ਪੰ', full: 'ਪੰਜਾਬੀ' },
];

export default function AuthLanguageToggle() {
  const { language, setLanguage } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-teal-700 hover:bg-white border border-teal-100 shadow-sm transition-all text-[11px] font-black uppercase tracking-widest active:scale-95"
      >
        <span>{current.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[116px]">
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => { setLanguage(opt.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black transition-colors ${language === opt.code ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{opt.label}</span>
              <span className="text-[9px] text-gray-400">{opt.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
