import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Languages,
  Activity,
  Trash2,
  Mic,
  Zap,
  Loader2
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { analyzeSymptomsLite } from '../services/api';
import { analyzeSymptomsLocal } from '../utils/localSymptomEngine';
import useVoiceInput from '../hooks/useVoiceInput';
import AuthLanguageToggle from '../components/AuthLanguageToggle';
import LowBandwidthToggle from '../components/LowBandwidthToggle';

const QUICK_SYMPTOMS = [
  { label: 'Bukhar \uD83C\uDF21\uFE0F', value: 'Bukhar' },
  { label: 'Khansi \uD83D\uDE37', value: 'Khansi' },
  { label: 'Sar Dard \uD83E\uDD15', value: 'Sar Dard' },
  { label: 'Pet Dard \uD83E\uDD22', value: 'Pet Dard' },
  { label: 'Kamzori \uD83D\uDE13', value: 'Kamzori' },
  { label: 'Chakkar \uD83D\uDE35', value: 'Chakkar' },
];

export default function SymptomChecker() {
  const { currentPatient, language, toggleLanguage, setLastAnalysis, lowBw } = useContext(AppContext);
  const navigate = useNavigate();
  const { isListening, transcript, isSupported, startListening, stopListening, setTranscript } = useVoiceInput({ language });

  const [symptoms, setSymptoms] = useState('');
  const [baseSymptoms, setBaseSymptoms] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentPatient) navigate('/login');
  }, [currentPatient, navigate]);

  // Append logic: Base symptoms + current transcript
  useEffect(() => {
    if (isListening) {
        const punctuation = (baseSymptoms && !baseSymptoms.endsWith(' ')) ? ' ' : '';
        setSymptoms(baseSymptoms + punctuation + transcript);
    }
  }, [transcript, isListening, baseSymptoms]);

  // Capture base symptoms when microphone starts
  const handleToggleMic = () => {
    if (isListening) {
        stopListening();
    } else {
        setBaseSymptoms(symptoms);
        startListening();
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setBaseSymptoms('');
    setTranscript('');
    if (isListening) stopListening();
  };

  const addChip = (value) => {
    setSymptoms((prev) => {
        const prefix = prev ? `${prev}, ` : '';
        return prefix + value;
    });
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeSymptomsLite({
        patient_id: currentPatient.id,
        symptoms: symptoms.trim(),
        language
      });
      setLastAnalysis({ result, symptoms });
      navigate('/symptom-result');
    } catch (err) {
      console.warn("API Analytics failed, switching to local offline engine.");
      const localResult = analyzeSymptomsLocal(symptoms.trim(), language);
      setLastAnalysis({ result: localResult, symptoms });
      navigate('/symptom-result');
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) return null;

  return (
    <div className={`min-h-screen ${lowBw ? 'bg-white' : 'bg-gray-50/50'} pb-32`}>
      {/* Top Header */}
      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {!lowBw && (
                    <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
                        <Activity size={24} />
                    </div>
                )}
                <div>
                   <h1 className="text-2xl font-black text-gray-800 tracking-tight">Check Symptoms</h1>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">HEALTHCARE DASHBOARD</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
               <LowBandwidthToggle />
               <AuthLanguageToggle language={language} toggleLanguage={toggleLanguage} />
            </div>
        </div>

        {/* Greeting Section */}
        <div className="mt-4">
           <h2 className="text-3xl font-black text-gray-800 leading-tight">
             Namaste {currentPatient.name.split(' ')[0]} 🙏
           </h2>
           <p className="text-gray-500 font-bold mt-1 text-lg">Aapko kya takleef hai?</p>
        </div>

        {/* Voice Input Section */}
        <div className={`rounded-[40px] p-8 mt-4 border border-gray-100 relative overflow-hidden group ${
            lowBw ? 'bg-gray-50' : 'bg-white shadow-xl shadow-purple-900/5'
        }`}>
            {!lowBw && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>}
            
            <div className="relative z-10 flex flex-col items-center">
                <button 
                    onClick={handleToggleMic}
                    className={`w-28 h-28 rounded-[32px] flex items-center justify-center transition-all duration-200 transform active:scale-95 ${
                        isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-50 text-purple-600 border border-gray-100'
                    } ${!lowBw && isListening ? 'animate-pulse scale-105 shadow-2xl shadow-red-200' : ''}`}
                >
                    <Mic size={48} className={isListening && !lowBw ? 'animate-bounce' : ''} />
                </button>
                <p className={`mt-6 text-sm font-black uppercase tracking-[0.2em] ${isListening ? 'text-red-500' : 'text-gray-400'}`}>
                    {isListening ? 'Listening...' : 'Tap for Voice Input'}
                </p>
            </div>

            <div className="mt-12 space-y-4 relative">
                <textarea 
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms here or use voice..."
                    className={`w-full p-8 rounded-[32px] outline-none text-lg font-bold transition-all min-h-[180px] resize-none ${
                        lowBw ? 'bg-white border-2 border-gray-200' : 'bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 text-gray-700'
                    }`}
                />
                {symptoms && (
                    <button 
                        onClick={handleClear}
                        className="absolute bottom-6 right-6 p-3 bg-white text-red-500 border border-red-100 rounded-2xl shadow-sm hover:bg-red-50 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                    >
                        <Trash2 size={14} />
                        Clear
                    </button>
                )}
            </div>

            {/* Chips */}
            <div className="mt-8 flex flex-wrap gap-2">
                {QUICK_SYMPTOMS.map(chip => (
                    <button 
                        key={chip.value}
                        onClick={() => addChip(chip.value)}
                        className={`px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-600 transition-all active:scale-95 ${
                            lowBw ? '' : 'shadow-sm hover:border-purple-200 hover:text-purple-600'
                        }`}
                    >
                        + {chip.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-50 border-t ${
        lowBw ? 'bg-white border-gray-200' : 'bg-white/80 backdrop-blur-xl border-gray-100'
      }`}>
          <button 
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || loading}
            className={`w-full text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                lowBw ? 'bg-gray-900' : 'bg-purple-600 shadow-2xl shadow-purple-500/30 hover:bg-purple-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (!lowBw && <Zap size={22} className="fill-current" />)}
            <span>AI se Salah Lo →</span>
          </button>
      </div>
    </div>
  );
}
