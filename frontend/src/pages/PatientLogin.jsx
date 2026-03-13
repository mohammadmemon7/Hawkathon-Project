import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Phone } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getPatientByPhone } from '../services/api';

export default function PatientLogin() {
  const { patient, setPatient } = useContext(AppContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      navigate('/', { replace: true });
    }
  }, [navigate, patient]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setLoading(true);
      const loggedInPatient = await getPatientByPhone(phone.trim());
      setPatient(loggedInPatient);
      navigate('/', { replace: true });
    } catch {
      setError('Patient not found. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Patient Login
          </p>
          <h1 className="text-2xl font-bold text-gray-800">Login by phone number</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your registered mobile number to continue where you left off.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700">
              Registered phone number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" size={18} />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
          New patient?{' '}
          <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}