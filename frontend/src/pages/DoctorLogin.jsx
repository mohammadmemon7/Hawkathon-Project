import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthLanguageToggle from '../components/AuthLanguageToggle';
import useT from '../i18n/useT';

export default function DoctorLogin() {
  const { setCurrentDoctor } = useContext(AppContext);
  const t = useT();
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
    <div className="min-h-[calc(100vh-51px)] bg-gray-50 px-4 py-8 md:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
        <div className="absolute top-6 right-6">
          <AuthLanguageToggle />
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t('doctorLogin')}</h1>
          <p className="text-sm text-gray-500">{t('loginSubtitle')}</p>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No available doctors at the moment.</p>
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
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 uppercase tracking-wider">
                    Available
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
