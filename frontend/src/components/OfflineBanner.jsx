import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-400 text-amber-950 px-4 py-3 shadow-lg shadow-amber-900/20 border-t border-amber-500 animate-[slideUp_0.3s_ease-out]">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
        <WifiOff size={20} className="animate-pulse" />
        <p className="font-bold text-sm tracking-wide">
          📡 Aap offline hain — purana data dikha rahe hain
        </p>
      </div>
    </div>
  );
}
