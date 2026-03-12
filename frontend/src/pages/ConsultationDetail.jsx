import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getConsultation, updateConsultation, completeConsultation } from '../services/api';
import TriageCard from '../components/TriageCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ConsultationDetail() {
  const { id } = useParams();
  const { currentDoctor } = useContext(AppContext);
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getConsultation(id);
        setConsultation(data);
        setDoctorNotes(data.doctor_notes || '');
        setPrescription(data.prescription || '');
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateConsultation(id, { doctor_notes: doctorNotes, prescription });
      await completeConsultation(id, currentDoctor?.id);
      setToast('Consultation complete ho gayi!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch {
      setToast('Kuch gadbad ho gayi. Dobara try karein.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!consultation) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>Consultation nahi mili</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 pb-8">
      {/* Top bar */}
      <div className="px-4 pt-4 mb-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> Wapas Dashboard
        </button>
      </div>

      {toast && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Patient Info */}
      <div className="mx-4 bg-white rounded-xl shadow-sm border p-4 mb-4">
        <h2 className="font-bold text-base" style={{ color: 'var(--primary)' }}>{consultation.patient_name}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          {consultation.patient_age && <span>Age: {consultation.patient_age}</span>}
          {consultation.patient_village && <span>{consultation.patient_village}</span>}
          {consultation.patient_phone && <span>{consultation.patient_phone}</span>}
        </div>
      </div>

      {/* Symptoms */}
      <div className="mx-4 mb-4">
        <h3 className="font-semibold text-sm mb-2">Symptoms</h3>
        <div className="bg-white rounded-xl border p-4 text-sm">{consultation.symptoms}</div>
      </div>

      {/* AI Analysis */}
      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-2 px-4">AI Analysis</h3>
        <TriageCard
          level={consultation.ai_triage_level}
          explanation={consultation.ai_explanation}
          action={consultation.ai_action}
          remedies={consultation.ai_remedies}
          warning={consultation.ai_warning}
          isEmergency={consultation.ai_triage_level === 'EMERGENCY'}
        />
      </div>

      {/* Doctor Notes */}
      <div className="mx-4 mb-4">
        <label className="block text-sm font-semibold mb-2">Doctor Notes</label>
        <textarea
          value={doctorNotes}
          onChange={(e) => setDoctorNotes(e.target.value)}
          placeholder="Apne notes likhein..."
          rows={3}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Prescription */}
      <div className="mx-4 mb-6">
        <label className="block text-sm font-semibold mb-2">Prescription</label>
        <textarea
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          placeholder="Dawai likhein..."
          rows={3}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Complete Button */}
      <div className="px-4">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="w-full text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ backgroundColor: 'var(--safe)' }}
        >
          {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Complete Karo \u2713'}
        </button>
      </div>
    </div>
  );
}
