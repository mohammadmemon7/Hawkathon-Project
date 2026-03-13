import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

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
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-500">
      <div className="bg-amber-500 text-white px-4 py-3 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <WifiOff size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-wider leading-none">Offline Mode Active</p>
            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">
              Limited connectivity detected. Showing cached medical records.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all border border-white/10 group"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-black uppercase tracking-widest">Retry</span>
        </button>
      </div>
      
      {/* Decorative Blur Bottom */}
      <div className="h-4 bg-gradient-to-b from-amber-500/20 to-transparent backdrop-blur-[2px]"></div>
    </div>
  );
}
