import React, { useContext, useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import NotificationDropdown from './NotificationDropdown';
import LowBandwidthToggle from './LowBandwidthToggle';
import useT from '../i18n/useT';

const LANG_OPTIONS = [
  { code: 'hi', label: 'हिं', full: 'हिंदी' },
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'pa', label: 'ਪੰ', full: 'ਪੰਜਾਬੀ' },
];

export default function TopHeader({ onMenuClick }) {
  const location = useLocation();
  const { currentPatient, language, setLanguage } = useContext(AppContext);
  const t = useT();
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef(null);

  const activeUserName = currentPatient?.name || 'Guest User';
  const activeUserInitial = activeUserName.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/symptoms')) return t('checkSymptoms');
    if (path.startsWith('/talk'))     return t('talkToDoctor');
    if (path.startsWith('/records'))  return t('myRecords');
    if (path.startsWith('/medicines')) return t('pharmacy');
    if (path.startsWith('/book-appointment')) return t('appointments');
    if (path.startsWith('/profile')) return t('home');
    if (path.startsWith('/analytics')) return t('healthRiskMap');
    if (path.startsWith('/sms'))     return t('smsTelehealth');
    if (path.startsWith('/doctors')) return t('doctors');
    return t('overview');
  };

  const currentLang = LANG_OPTIONS.find(l => l.code === language) || LANG_OPTIONS[0];

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-6">
        <button
          className="md:hidden p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-all shadow-sm"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">{getPageTitle()}</h1>
          <p className="hidden sm:block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">
            {t('healthDashboard')}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 md:gap-7">
        {/* Search — desktop */}
        <div className="hidden lg:flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-teal-500/10 focus-within:border-teal-500/30 transition-all">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder={t('search') + '...'}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 placeholder:text-gray-400 w-full"
          />
        </div>

        <div className="flex items-center gap-3 pr-2 md:pr-4 border-r border-gray-100">
          <LowBandwidthToggle />

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all font-black text-sm border border-teal-100"
            >
              <span>{currentLang.label}</span>
              <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[120px]">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-black transition-colors ${language === opt.code ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-bold text-gray-400">{opt.full}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifs & Profile */}
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[15px] font-black text-gray-800 leading-tight">{activeUserName}</span>
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                {currentPatient ? `PID: ${currentPatient.id || 'N/A'}` : 'Guest Mode'}
              </span>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-teal-600/20 group-hover:scale-105 transition-transform duration-300 ring-2 ring-white border border-teal-100 uppercase">
                {activeUserInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function TopHeader({ onMenuClick }) {
  const location = useLocation();
  const { currentPatient, language, toggleLanguage } = useContext(AppContext);

  // Fallback for avatar/name
  const activeUserName = currentPatient?.name || 'Guest User';
  const activeUserInitial = activeUserName.charAt(0).toUpperCase();

  const getPageTitle = () => {
    const path = location.pathname;
    // Map paths to Titles
    if (path.startsWith('/symptoms')) return language === 'hi' ? 'लक्षण जांचें' : 'Check Symptoms';
    if (path.startsWith('/talk')) return language === 'hi' ? 'डॉक्टर से बात करें' : 'Talk to Doctor';
    if (path.startsWith('/records')) return language === 'hi' ? 'मेरे रिकॉर्ड' : 'My Records';
    if (path.startsWith('/medicines')) return language === 'hi' ? 'फार्मेसी' : 'Pharmacy';
    if (path.startsWith('/book-appointment')) return language === 'hi' ? 'नियुक्ति' : 'Appointment';
    if (path.startsWith('/profile')) return language === 'hi' ? 'प्रोफ़ाइल' : 'Profile';
    // Default/Overview
    return language === 'hi' ? 'अवलोकन' : 'Overview';
  };

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-6">
        <button 
          className="md:hidden p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-all shadow-sm"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="hidden sm:block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-0.5">
            {language === 'hi' ? 'स्वास्थ्य डैशबोर्ड' : 'Healthcare Dashboard'}
          </p>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-7">
        
        {/* Search Bar - Desktop Only */}
        <div className="hidden lg:flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-teal-500/10 focus-within:border-teal-500/30 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder={language === 'hi' ? 'खोजें...' : 'Search...'} 
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Global Toggles */}
        <div className="flex items-center gap-3 pr-2 md:pr-4 border-r border-gray-100">
          <LowBandwidthToggle />
          
          <button
            onClick={toggleLanguage}
            className="p-2.5 rounded-xl text-teal-600 bg-teal-50/50 hover:bg-teal-600 hover:text-white transition-all duration-300 shadow-sm"
            title="Switch Language"
          >
            <Languages size={20} />
          </button>
        </div>

        {/* Notifs & Profile */}
        <div className="flex items-center gap-4">
          <NotificationDropdown />

          <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[15px] font-black text-gray-800 leading-tight">
                {activeUserName}
              </span>
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                {currentPatient ? `PID: ${currentPatient.id || 'N/A'}` : 'Guest Mode'}
              </span>
            </div>
            
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-teal-600/20 group-hover:scale-105 transition-transform duration-300 ring-2 ring-white border border-teal-100 uppercase">
                {activeUserInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
