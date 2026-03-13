import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Stethoscope, 
  Video, 
  FileText, 
  Pill, 
  LogOut, 
  X, 
  Activity,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, logoutPatient, currentDoctor } = useContext(AppContext);

  // Nav items based on the requirement
  const navItems = [
    { name: language === 'hi' ? 'होम' : 'Home', path: '/', icon: <Home size={22} /> },
    { name: language === 'hi' ? 'लक्षण जांचें' : 'Check Symptoms', path: '/symptoms', icon: <Stethoscope size={22} /> },
    { name: language === 'hi' ? 'डॉक्टर से बात करें' : 'Talk to Doctor', path: '/talk', icon: <Video size={22} /> },
    { name: language === 'hi' ? 'मेरे रिकॉर्ड' : 'My Records', path: '/records', icon: <FileText size={22} /> },
    { name: language === 'hi' ? 'अपॉइंटमेंट' : 'Appointments', path: '/book-appointment', icon: <CalendarDays size={22} /> },
    { name: language === 'hi' ? 'फार्मेसी' : 'Pharmacy', path: '/medicines', icon: <Pill size={22} /> },
  ];

  const handleLogout = () => {
    setIsOpen(false);
    logoutPatient();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20 rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer">
              <Activity className="text-white" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-gray-800 leading-none">
                SehatSetu
              </span>
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] mt-1">
                AI Healthcare
              </span>
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-teal-50 hover:text-teal-700 hover:translate-x-1'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    transition-all duration-300
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {item.icon}
                  </div>
                  <span className="font-bold text-[15px]">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="opacity-60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section / Logout */}
        <div className="p-6 mt-auto border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 hidden md:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700">Online & Ready</span>
            </div>
          </div>
          
          <button 
            className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 font-bold group"
            onClick={handleLogout}
          >
            <div className="group-hover:-translate-x-1 transition-transform">
              <LogOut size={22} />
            </div>
            <span>{language === 'hi' ? 'लॉग आउट' : 'Log Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
