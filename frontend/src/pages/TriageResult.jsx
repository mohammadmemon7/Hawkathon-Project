import { useLocation, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import TriageCard from '../components/TriageCard';
import EmergencyBanner from '../components/EmergencyBanner';

export default function TriageResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const consultation = location.state?.consultation;

  if (!consultation) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center">
          <p style={{ color: 'var(--muted)' }}>Koi result nahi mila</p>
          <button
            onClick={() => navigate('/symptoms')}
            className="mt-4 px-6 py-2 rounded-xl text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Symptoms Batayein
          </button>
        </div>
      </div>
    );
  }

  const level = consultation.ai_triage_level;
  const isEmergency = level === 'EMERGENCY';

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'SehatSetu AI — Triage Result',
        text: `Triage: ${level}\nSymptoms: ${consultation.symptoms}\nAction: ${consultation.ai_action}`,
      });
    } catch {
      // user cancelled
    }
  };

  const getCta = () => {
    switch (level) {
      case 'EMERGENCY':
        return (
          <a
            href="https://maps.google.com/?q=Nabha+Civil+Hospital"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center text-white font-semibold py-3 rounded-xl bg-red-600"
          >
            \uD83D\uDEA8 Nearest Hospital — Nabha Civil Hospital
          </a>
        );
      case 'CONSULT_SOON':
        return (
          <button
            onClick={() => navigate('/medicines')}
            className="w-full text-white font-semibold py-3 rounded-xl"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            Doctor Se Milein \u2192
          </button>
        );
      default:
        return (
          <button
            onClick={() => navigate(`/profile/${consultation.patient_id}`)}
            className="w-full text-white font-semibold py-3 rounded-xl"
            style={{ backgroundColor: 'var(--safe)' }}
          >
            Profile Dekho \u2192
          </button>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 pb-8">
      <TriageCard
        level={level}
        explanation={consultation.ai_explanation}
        action={consultation.ai_action}
        remedies={consultation.ai_remedies}
        warning={consultation.ai_warning}
        isEmergency={isEmergency}
      />

      {/* CTA + Actions */}
      <div className="px-4 mt-6 space-y-3">
        {getCta()}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/symptoms')}
            className="flex-1 font-medium py-2.5 rounded-xl border-2"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            Dobara Check Karo
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-300 text-gray-600"
            >
              <Share2 size={16} /> Share
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="px-4 mt-6 text-xs text-center" style={{ color: 'var(--muted)' }}>
        Yeh AI dwara di gayi salah hai, doctor ki jagah nahi. Gambhir sthiti mein turant doctor se milein.
      </p>
    </div>
  );
}
