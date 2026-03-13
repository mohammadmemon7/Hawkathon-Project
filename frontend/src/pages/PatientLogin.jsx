import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getPatientByPhone } from '../services/api';

export default function PatientLogin() {
  const { setCurrentPatient } = useContext(AppContext);
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setToast('Phone number 10 digit ka hona chahiye');
      return;
    }

    setLoading(true);
    setToast('');
    try {
      const patient = await getPatientByPhone(phone);
      
      setCurrentPatient(patient);
      localStorage.setItem('patient', JSON.stringify(patient));
      navigate('/symptoms');
    } catch {
      setToast('Khata nahi mila. Kripya phone number check karein ya naya account banayein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex flex-col justify-center px-4 py-6">
      <div className="max-w-md w-full mx-auto bg-white p-6 rounded-2xl shadow-sm border">
        <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--primary)' }}>
          Welcome Back
        </h1>
        <p className="text-gray-500 text-sm mb-6 text-center">Apne account mein login karein</p>

        {toast && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm font-medium">
            {toast}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
               type="tel"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               placeholder="10 digit number"
               maxLength={10}
               className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Check kar rahe hain...</> : 'Login Karien'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Naya account banayein? </span>
          <Link to="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
