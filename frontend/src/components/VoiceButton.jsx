import { Mic, MicOff } from 'lucide-react';

export default function VoiceButton({ isListening, onStart, onStop }) {
  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500 shadow-lg shadow-red-300'
          : 'shadow-lg shadow-teal-200'
      }`}
      style={!isListening ? { backgroundColor: 'var(--primary)' } : {}}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
      )}
      {isListening ? (
        <MicOff size={36} className="text-white relative z-10" />
      ) : (
        <Mic size={36} className="text-white relative z-10" />
      )}
    </button>
  );
}
