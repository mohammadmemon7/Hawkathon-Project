import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const STORAGE_KEY = 'lowBandwidth';

export default function LowBandwidthToggle() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  useEffect(() => {
    if (enabled) {
      document.body.classList.add('low-bandwidth');
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      document.body.classList.remove('low-bandwidth');
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [enabled]);

  // Apply on mount if already saved
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      document.body.classList.add('low-bandwidth');
    }
  }, []);

  return (
    <button
      onClick={() => setEnabled((prev) => !prev)}
      title={enabled ? 'Low-bandwidth mode ON — click to disable' : 'Enable low-bandwidth mode'}
      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        enabled
          ? 'bg-amber-100 border-amber-400 text-amber-700'
          : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
      }`}
    >
      {enabled ? <WifiOff size={14} /> : <Wifi size={14} />}
      {enabled ? 'Low BW' : 'Low BW'}
    </button>
  );
}
