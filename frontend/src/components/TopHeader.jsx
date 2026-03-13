import React, { useContext } from 'react';
import { Menu, Languages } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import NotificationDropdown from './NotificationDropdown';
import LowBandwidthToggle from './LowBandwidthToggle';

export default function TopHeader({ onMenuClick }) {
  const location = useLocation();
  const { currentPatient, currentDoctor, language, toggleLanguage } = useContext(AppContext);

  const activeUser = currentDoctor || currentPatient;
  const activeUserLabel = currentDoctor ? 'Dr.' : 'ID:';
  const activeUserName = activeUser?.name || 'Guest';
  const activeUserId = activeUser?.id || '';

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/symptoms')) return language === 'hi' ? 'लक्षण जांचें' : 'Check Symptoms';
    if (path.startsWith('/talk')) return language === 'hi' ? 'डॉक्टर से बात करें' : 'Talk to Doctor';
    if (path.startsWith('/records')) return language === 'hi' ? 'मेरे रिकॉर्ड' : 'My Records';
    if (path.startsWith('/medicines')) return language === 'hi' ? 'फार्मेसी' : 'Pharmacy';
    if (path.startsWith('/book-appointment')) return language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment';
    return language === 'hi' ? 'अवलोकन' : 'Overview';
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={toggleLanguage}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:bg-[var(--primary)] hover:text-white"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          <Languages size={14} />
          {language === 'hi' ? 'EN' : 'HI'}
        </button>

        <LowBandwidthToggle />
        <NotificationDropdown />

        <div className="flex items-center gap-3 border-l border-gray-100 pl-3 md:pl-5">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-gray-700">{activeUserName}</span>
            <span className="text-xs text-gray-400 font-medium tracking-wide">{activeUserId ? `${activeUserLabel} ${activeUserId}` : ''}</span>
          </div>
          <div className="relative">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-teal-500 text-white flex items-center justify-center font-bold text-base md:text-lg shadow-sm border-2 border-white ring-2 ring-gray-50">
              {activeUserName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
