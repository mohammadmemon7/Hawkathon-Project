import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Thoda intezaar karein...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
      {message && <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>{message}</p>}
    </div>
  );
}
