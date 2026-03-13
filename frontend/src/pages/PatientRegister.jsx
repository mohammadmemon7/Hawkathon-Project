import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { registerPatient } from '../services/api';

const VILLAGES = [
  'Nabha', 'Sirhind', 'Fatehgarh Sahib', 'Dera Bassi',
  'Morinda', 'Khamanon', 'Samana', 'Patiala', 'Other',
];

export default function PatientRegister() {
  const { setCurrentPatient } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'Purush', phone: '', village: 'Nabha', medical_history: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setToast('Naam aur phone number zaroori hai');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setToast('Phone number 10 digit ka hona chahiye');
      return;
    }

    setLoading(true);
    try {
      const patient = await registerPatient({
        ...form,
        age: form.age ? parseInt(form.age) : null,
      });

      if (patient.created_at && new Date(patient.created_at) < new Date(Date.now() - 5000)) {
        setToast(`Welcome back ${patient.name}!`);
      }

      setCurrentPatient(patient);
      localStorage.setItem('patient', JSON.stringify(patient));
      setTimeout(() => navigate('/symptoms'), 600);
    } catch {
      setToast('Kuch gadbad ho gayi. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--primary)' }}>
        Apni Jaankari Bharein
      </h1>

      {toast && (
        <div className="mb-4 p-3 rounded-lg bg-teal-50 text-teal-800 text-sm font-medium">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text" name="name" value={form.name} onChange={handleChange}
            placeholder="Apna poora naam likhen"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1">Age (Umr)</label>
          <input
            type="number" name="age" value={form.age} onChange={handleChange}
            placeholder="Jaise 35" min="0" max="120"
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <div className="flex gap-4">
            {['Purush', 'Mahila', 'Anya'].map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm">
                <input
                  type="radio" name="gender" value={g}
                  checked={form.gender === g} onChange={handleChange}
                  className="accent-teal-600"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <input
            type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="10 digit number" maxLength={10}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Village */}
        <div>
          <label className="block text-sm font-medium mb-1">Village / Town</label>
          <select
            name="village" value={form.village} onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Medical History */}
        <div>
          <label className="block text-sm font-medium mb-1">Medical History (optional)</label>
          <textarea
            name="medical_history" value={form.medical_history} onChange={handleChange}
            placeholder="Koi purani bimari ya dawai..."
            rows={3}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Bhej rahe hain...</> : 'Aage Badhein →'}
        </button>
      </form>
    </div>
  );
}
