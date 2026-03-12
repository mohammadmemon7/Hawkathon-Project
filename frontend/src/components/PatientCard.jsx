import { formatTimeAgo, getPriorityLabel, getTriageColor } from '../utils/helpers';

export default function PatientCard({ consultation, onReview }) {
  const symptoms = consultation.symptoms?.length > 60
    ? consultation.symptoms.slice(0, 60) + '...'
    : consultation.symptoms;

  const priorityColors = {
    3: 'bg-red-100 text-red-700',
    2: 'bg-amber-100 text-amber-700',
    1: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">{consultation.patient_name}</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{consultation.patient_village}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[consultation.priority_score] || 'bg-gray-100 text-gray-600'}`}>
          {getPriorityLabel(consultation.priority_score)}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-700">{symptoms}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {formatTimeAgo(consultation.created_at)}
        </span>
        <button
          onClick={() => onReview(consultation.id)}
          className="text-sm font-medium px-4 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Review
        </button>
      </div>
    </div>
  );
}
