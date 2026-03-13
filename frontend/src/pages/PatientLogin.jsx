import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Phone } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getPatientByPhone } from '../services/api';
import AuthLanguageToggle from '../components/AuthLanguageToggle';
import useT from '../i18n/useT';

export default function PatientLogin() {
  const { patient, setPatient } = useContext(AppContext);
  const t = useT();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) navigate('/', { replace: true });
  }, [navigate, patient]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const trimmedPhone = phone.trim();
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError(t('invalidPhone'));
      return;
    }
    try {
      setLoading(true);
      const loggedInPatient = await getPatientByPhone(trimmedPhone);
      setPatient(loggedInPatient);
      navigate('/', { replace: true });
    } catch {
      setError(t('patientNotFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex flex-col justify-center px-4 py-12 md:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 relative">
        <div className="absolute top-6 right-6">
          <AuthLanguageToggle />
        </div>
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {t('patientLogin')}
          </p>
          <h1 className="text-2xl font-bold text-gray-800">{t('loginTitle')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
              {t('phoneLabel')}
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" size={18} />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 pl-11 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? t('loggingIn') : t('loginBtn')}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-center">
          <span className="text-teal-900">{t('newPatient')} </span>
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            {t('registerLink')}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to="/doctor-login"
            className="flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-black text-blue-700 uppercase tracking-widest hover:bg-blue-100 transition-colors"
          >
            🩺 {t('doctorLogin')}
          </Link>
          <Link
            to="/worker"
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-colors"
          >
            👩‍⚕️ {t('ashaWorker')}
          </Link>
        </div>
      </div>
    </div>
  );
}
