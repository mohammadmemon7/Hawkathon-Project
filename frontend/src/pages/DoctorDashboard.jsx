import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getPendingConsultations } from '../services/api';
import PatientCard from '../components/PatientCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorDashboard() {
  const { currentDoctor } = useContext(AppContext);
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showSpinner) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await getPendingConsultations(1, 100);
      setConsultations(Array.isArray(res) ? res : (res.data || []));
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!currentDoctor) { navigate('/doctor-login'); return; }
    fetchData(false);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [currentDoctor, navigate, fetchData]);

  const emergencyCount = consultations.filter((c) => c.priority_score === 3).length;
  const normalCount = consultations.filter((c) => c.priority_score <= 1).length;

  if (!currentDoctor) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
          Dr. {currentDoctor.name} ka Dashboard
        </h1>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <RefreshCw size={20} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{consultations.length}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Pending</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
          <p className="text-2xl font-bold text-red-600">{emergencyCount}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Emergency</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border">
          <p className="text-2xl font-bold text-green-600">{normalCount}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Normal</p>
        </div>
      </div>

      {/* Queue */}
      {consultations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-green-600 font-medium">\u2705 Koi pending patient nahi</p>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-3">Patient Queue</h2>
          {consultations.map((c) => (
            <PatientCard
              key={c.id}
              consultation={c}
              onReview={(id) => navigate(`/consultation/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
