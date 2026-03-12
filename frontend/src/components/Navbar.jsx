import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
  const { language, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
          SehatSetu AI
        </span>
      </div>
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border"
        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
      >
        <Languages size={16} />
        {language === 'hi' ? 'EN' : 'HI'}
      </button>
    </nav>
  );
}
