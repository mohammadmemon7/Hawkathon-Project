import { useNavigate } from 'react-router-dom';
import { Plus, User, Stethoscope } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
        <Plus size={40} className="text-white" strokeWidth={3} />
      </div>

      <h1 className="text-3xl font-bold text-white mb-1">SehatSetu AI</h1>
      <p className="text-white/80 text-lg mb-10">आपका डिजिटल स्वास्थ्य साथी</p>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate('/register')}
          className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
            <User size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="font-semibold text-sm text-center" style={{ color: 'var(--text)' }}>
            Main Patient Hun
          </span>
        </button>

        <button
          onClick={() => navigate('/doctor-login')}
          className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
            <Stethoscope size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="font-semibold text-sm text-center" style={{ color: 'var(--text)' }}>
            Main Doctor Hun
          </span>
        </button>
      </div>

      <p className="mt-10 text-white/60 text-sm">Nabha aur 173 gaon ke liye</p>
    </div>
  );
}
