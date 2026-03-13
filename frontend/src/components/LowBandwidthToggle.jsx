import { useContext } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function LowBandwidthToggle() {
  const { lowBw, toggleLowBw } = useContext(AppContext);

  return (
    <button
      onClick={toggleLowBw}
      type="button"
      title={lowBw ? 'Low-bandwidth mode ON — click to disable' : 'Enable low-bandwidth mode'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
        lowBw
          ? 'bg-amber-100 border-amber-400 text-amber-700 shadow-none'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 shadow-sm'
      }`}
    >
      {lowBw ? <WifiOff size={14} /> : <Wifi size={14} />}
      <span>{lowBw ? 'Low BW' : 'Optimized'}</span>
    </button>
  );
}
