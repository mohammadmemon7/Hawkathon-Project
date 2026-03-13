import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, Video, ClipboardList, Pill, CalendarDays, LogOut, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, logout } = useContext(AppContext);

  const navItems = [
    { name: language === 'hi' ? 'होम' : 'Home', path: '/', icon: <Home size={20} /> },
    { name: language === 'hi' ? 'लक्षण जांचें' : 'Check Symptoms', path: '/symptoms', icon: <Activity size={20} /> },
    { name: language === 'hi' ? 'डॉक्टर से बात करें' : 'Talk to Doctor', path: '/talk', icon: <Video size={20} /> },
    { name: language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment', path: '/book-appointment', icon: <CalendarDays size={20} /> },
    { name: language === 'hi' ? 'मेरे रिकॉर्ड' : 'My Records', path: '/records', icon: <ClipboardList size={20} /> },
    { name: language === 'hi' ? 'फार्मेसी' : 'Pharmacy', path: '/medicines', icon: <Pill size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-[2px_0_12px_rgba(0,0,0,0.04)] border-r border-gray-100 flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <Activity className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
              SehatSetu 
            </span>
          </div>
          <button 
            className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                ${isActive 
                  ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[var(--primary)]'}
              `}
            >
              <div className={`transition-transform duration-200 ${location.pathname !== item.path && 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <button 
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium group"
            onClick={() => {
              logout();
              setIsOpen(false);
              navigate('/login');
            }}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'hi' ? 'लॉग आउट' : 'Log Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
