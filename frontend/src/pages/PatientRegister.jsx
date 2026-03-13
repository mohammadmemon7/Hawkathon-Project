import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, User, Phone, MapPin, Clipboard } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { registerPatient } from '../services/api';
import AuthLanguageToggle from '../components/AuthLanguageToggle';

const VILLAGES = [
  'Nabha', 'Sirhind', 'Fatehgarh Sahib', 'Dera Bassi',
  'Morinda', 'Khamanon', 'Samana', 'Patiala', 'Other',
];

export default function PatientRegister() {
  const { setPatient, language, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'Purush', phone: '', village: 'Nabha', medical_history: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError(language === 'hi' ? 'Naam aur phone number zaroori hai' : 'Name and phone number are required.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError(language === 'hi' ? 'Phone number 10 digit ka hona chahiye' : 'Phone number must be 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const patient = await registerPatient({
        ...form,
        age: form.age ? parseInt(form.age) : null,
      });

      setPatient(patient);
      setTimeout(() => navigate('/symptoms'), 600);
    } catch {
      setError(language === 'hi' ? 'Kuch gadbad ho gayi. Dobara try karein.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: language === 'hi' ? 'अपनी जानकारी भरें' : 'Patient Registration',
    subtitle: language === 'hi' ? 'सटीक इलाज़ के लिए अपनी जानकारी दें' : 'Provide your details for accurate care.',
    loginPrompt: language === 'hi' ? 'पहले से रजिस्टर हैं?' : 'Already registered?',
    loginLink: language === 'hi' ? 'लॉगिन करें →' : 'Login here →',
    name: language === 'hi' ? 'पूरा नाम *' : 'Full Name *',
    age: language === 'hi' ? 'उम्र' : 'Age',
    gender: language === 'hi' ? 'लिंग' : 'Gender',
    phone: language === 'hi' ? 'फोन नंबर *' : 'Phone Number *',
    village: language === 'hi' ? 'गाँव / शहर' : 'Village / Town',
    history: language === 'hi' ? 'पुरानी बीमारी (वैकल्पिक)' : 'Medical History (optional)',
    button: language === 'hi' ? 'आगे बढ़ें →' : 'Continue →',
    loading: language === 'hi' ? 'भेज रहे हैं...' : 'Submitting...',
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
        <div className="absolute top-8 right-8">
          <AuthLanguageToggle language={language} toggleLanguage={toggleLanguage} />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        <div className="mb-8 rounded-2xl bg-teal-50 p-4 border border-teal-100 flex items-center justify-between">
          <p className="text-sm font-medium text-teal-900">{t.loginPrompt}</p>
          <Link to="/login" className="text-sm font-bold text-teal-700 hover:text-teal-800">
            {t.loginLink}
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.name}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Rahul Kumar"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.phone}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="9876543210" maxLength={10}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.age}</label>
              <input
                type="number" name="age" value={form.age} onChange={handleChange}
                placeholder="35" min="0" max="120"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.gender}</label>
              <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border border-gray-200">
                {['Purush', 'Mahila', 'Anya'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({...form, gender: g})}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${form.gender === g ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {language === 'hi' ? g : (g === 'Purush' ? 'Male' : g === 'Mahila' ? 'Female' : 'Other')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.village}</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="village" value={form.village} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm outline-none appearance-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.history}</label>
            <div className="relative">
              <Clipboard className="absolute left-4 top-4 text-gray-400" size={18} />
              <textarea
                name="medical_history" value={form.medical_history} onChange={handleChange}
                placeholder={language === 'hi' ? 'Koi purani bimari...' : 'Diabetes, hypertension, etc.'}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
            {loading ? t.loading : t.button}
          </button>
        </form>
      </div>
    </div>
  );
}
