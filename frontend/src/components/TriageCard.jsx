import { getTriageColor, getTriageIcon } from '../utils/helpers';
import EmergencyBanner from './EmergencyBanner';

export default function TriageCard({ level, explanation, action, remedies, warning, isEmergency }) {
  const bgColor = getTriageColor(level);
  const icon = getTriageIcon(level);

  return (
    <div className="w-full">
      <EmergencyBanner isVisible={isEmergency} />

      <div className={`${bgColor} text-white rounded-2xl p-5 mx-4 mt-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{icon}</span>
          <span className="text-xl font-bold">{level}</span>
        </div>
        <p className="text-white/90 leading-relaxed">{explanation}</p>
      </div>

      <div className="mx-4 mt-4 border-2 rounded-xl p-4" style={{ borderColor: 'var(--primary)' }}>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--primary)' }}>Abhi kya karein:</h3>
        <p>{action}</p>
      </div>

      {remedies && remedies.length > 0 && (
        <div className="mx-4 mt-4 bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold mb-2 text-green-800">Ghar par upay:</h3>
          <ul className="list-disc list-inside space-y-1 text-green-900">
            {(typeof remedies === 'string' ? JSON.parse(remedies) : remedies).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {warning && (
        <p className="mx-4 mt-3 text-sm" style={{ color: 'var(--warning)' }}>
          \u26A0\uFE0F {warning}
        </p>
      )}
    </div>
  );
}
