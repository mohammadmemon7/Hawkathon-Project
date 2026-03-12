import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorLogin() {
  const { setCurrentDoctor } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAvailableDoctors();
        setDoctors(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = (doctor) => {
    setCurrentDoctor(doctor);
    navigate('/dashboard');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Doctor Login</h1>
      <p className="mb-6" style={{ color: 'var(--muted)' }}>Aap kaun hain?</p>

      {doctors.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--muted)' }}>Koi available doctor nahi hai abhi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelect(doc)}
              className="w-full bg-white rounded-xl shadow-sm border p-4 text-left hover:ring-2 hover:ring-teal-400 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{doc.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{doc.specialization}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Available
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
