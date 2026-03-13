import React, { useState, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  Activity,
  LayoutDashboard,
  Calendar,
  LogOut,
  ChevronRight,
  Package
} from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function DoctorSidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, logoutDoctor } = useContext(AppContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Appointments', path: '/doctor-appointments', icon: <Calendar size={22} /> },
    { name: 'Medicine Inventory', path: '/medicine-admin', icon: <Package size={22} /> },
  ];

  const handleLogout = () => {
    setIsOpen(false);
    logoutDoctor();
    navigate('/doctor-login');
  };

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 flex flex-col transform transition-all duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Activity className="text-white" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-800 leading-none">SehatSetu</span>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1">Doctor Portal</span>
            </div>
          </div>
          <button className="md:hidden p-2 text-gray-400" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all
                ${isActive ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-700'}
              `}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="font-bold text-[15px]">{item.name}</span>
              </div>
              <ChevronRight size={16} className="opacity-60" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold group">
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
