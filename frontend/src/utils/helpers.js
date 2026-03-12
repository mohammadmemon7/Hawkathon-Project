export function getTriageColor(level) {
  switch (level) {
    case 'EMERGENCY': return 'bg-red-600';
    case 'CONSULT_SOON': return 'bg-amber-500';
    case 'HOME_REMEDY': return 'bg-green-600';
    default: return 'bg-gray-500';
  }
}

export function getTriageIcon(level) {
  switch (level) {
    case 'EMERGENCY': return '\uD83D\uDEA8';
    case 'CONSULT_SOON': return '\u26A0\uFE0F';
    case 'HOME_REMEDY': return '\u2705';
    default: return '\u2139\uFE0F';
  }
}

export function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Abhi abhi';
  if (diffMin < 60) return `${diffMin} min pehle`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ghante pehle`;

  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} din pehle`;
}

export function getPriorityLabel(score) {
  switch (score) {
    case 3: return 'Emergency';
    case 2: return 'High Priority';
    case 1: return 'Normal';
    default: return 'Unknown';
  }
}
