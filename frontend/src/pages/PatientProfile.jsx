import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientByPhone, getPatientHistory } from '../services/api';
import { getTriageColor, formatTimeAgo } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const hist = await getPatientHistory(id);
        setHistory(hist);
        // Patient info from first consultation or fetch separately
        if (hist.length > 0 && hist[0].patient_name) {
          setPatient({ name: hist[0].patient_name, village: hist[0].patient_village });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6">
      {/* Patient Info */}
      {patient && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{patient.name}</h2>
          {patient.village && <p className="text-sm" style={{ color: 'var(--muted)' }}>{patient.village}</p>}
        </div>
      )}

      {/* History */}
      <h3 className="font-semibold text-base mb-3">Consultation History</h3>

      {history.length === 0 ? (
        <div className="text-center py-10">
          <p style={{ color: 'var(--muted)' }}>Abhi tak koi consultation nahi</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {history.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {formatTimeAgo(c.created_at)}
                </span>
                {c.ai_triage_level && (
                  <span className={`${getTriageColor(c.ai_triage_level)} text-white text-xs font-medium px-2 py-0.5 rounded-full`}>
                    {c.ai_triage_level}
                  </span>
                )}
              </div>
              <p className="text-sm mb-2">{c.symptoms}</p>
              {c.doctor_notes && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">Doctor Notes:</p>
                  <p className="text-sm text-blue-900">{c.doctor_notes}</p>
                </div>
              )}
              {c.prescription && (
                <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                  <p className="text-xs font-medium text-purple-800">Prescription:</p>
                  <p className="text-sm text-purple-900">{c.prescription}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate('/symptoms')}
          className="flex-1 text-white font-semibold py-3 rounded-xl"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Nayi Consultation
        </button>
        <button
          onClick={() => navigate('/medicines')}
          className="flex-1 font-semibold py-3 rounded-xl border-2"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          Dawai Dhundho
        </button>
      </div>
    </div>
  );
}
