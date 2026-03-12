import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => setVisible(false), 2000); // Hide after showing "back online" briefly
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) setVisible(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transform transition-all duration-300 ${isOnline ? 'bg-green-500' : 'bg-amber-500'} text-white shadow-md flex items-center justify-between px-4 py-3 md:px-6`}>
      <div className="flex items-center gap-3">
        <WifiOff size={20} className={isOnline ? 'hidden' : 'block'} />
        <span className="font-bold text-sm md:text-base tracking-wide">
          {isOnline 
            ? 'Connected - Back Online' 
            : 'Aap offline hain — purana data dikha rahe hain'}
        </span>
      </div>
      
      <button 
        onClick={() => setVisible(false)}
        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}
