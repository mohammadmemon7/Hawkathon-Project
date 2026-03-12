import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { createConsultation } from '../services/api';
import useVoiceInput from '../hooks/useVoiceInput';
import VoiceButton from '../components/VoiceButton';

const QUICK_SYMPTOMS = [
  { label: 'Bukhar \uD83C\uDF21\uFE0F', value: 'Bukhar' },
  { label: 'Khansi \uD83D\uDE37', value: 'Khansi' },
  { label: 'Sar Dard \uD83E\uDD15', value: 'Sar Dard' },
  { label: 'Pet Dard \uD83E\uDD22', value: 'Pet Dard' },
  { label: 'Kamzori \uD83D\uDE13', value: 'Kamzori' },
  { label: 'Chakkar \uD83D\uDE35', value: 'Chakkar' },
];

export default function SymptomChecker() {
  const { currentPatient } = useContext(AppContext);
  const navigate = useNavigate();
  const { isListening, transcript, isSupported, startListening, stopListening, setTranscript } = useVoiceInput();

  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentPatient) navigate('/register');
  }, [currentPatient, navigate]);

  useEffect(() => {
    if (transcript) setSymptoms(transcript);
  }, [transcript]);

  const addChip = (value) => {
    setSymptoms((prev) => (prev ? `${prev}, ${value}` : value));
  };

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const consultation = await createConsultation({
        patient_id: currentPatient.id,
        symptoms: symptoms.trim(),
      });
      navigate('/result', { state: { consultation } });
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) return null;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6 flex flex-col">
      {/* Greeting */}
      <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
        Namaste {currentPatient.name} \uD83D\uDE4F
      </h1>
      <p className="mb-6" style={{ color: 'var(--muted)' }}>Aapko kya takleef hai?</p>

      {/* Voice Button */}
      {isSupported && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <VoiceButton isListening={isListening} onStart={startListening} onStop={stopListening} />
          <span className="text-sm font-medium" style={{ color: isListening ? 'var(--emergency)' : 'var(--muted)' }}>
            {isListening ? 'Sun raha hun...' : 'Bolein'}
          </span>
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={symptoms}
        onChange={(e) => { setSymptoms(e.target.value); setTranscript(e.target.value); }}
        placeholder={isSupported ? 'Yahan aapki baat dikhegi ya type karein...' : 'Apne symptoms type karein'}
        rows={4}
        className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-4"
      />

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK_SYMPTOMS.map((s) => (
          <button
            key={s.value}
            onClick={() => addChip(s.value)}
            className="px-3 py-1.5 rounded-full text-sm border hover:bg-teal-50 transition-colors"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-auto">
        {loading ? (
          <div className="flex flex-col items-center py-6">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>AI analyze kar raha hai...</p>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!symptoms.trim()}
            className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            AI se Salah Lo \u2192
          </button>
        )}
      </div>
    </div>
  );
}
