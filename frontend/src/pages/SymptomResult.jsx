import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight,
  ClipboardList,
  Share2,
  PhoneCall,
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { createConsultation } from '../services/api';

export default function SymptomResult() {
  const { lastAnalysis, language, currentPatient, lowBw } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { result, symptoms } = lastAnalysis || {};

  const handleTalkToDoctor = async () => {
    if (!result || !currentPatient) return;
    setLoading(true);
    try {
      await createConsultation({
        patient_id: currentPatient.id,
        symptoms: symptoms,
        symptom_check_id: result.id
      });
      navigate('/talk');
    } catch (err) {
      console.error(err);
      alert('Failed to connect to doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const text = `Symptom Analysis: ${result.condition}\nRisk: ${result.risk_level}\nSymptoms: ${symptoms}\nRecommendation: ${result.recommendation}`;
    navigator.clipboard.writeText(text);
    alert('Analysis copied to clipboard!');
  };

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white">
        <ClipboardList size={64} className="text-gray-200" />
        <h1 className="text-xl font-black text-gray-800">No Analysis Found</h1>
        <button 
          onClick={() => navigate('/symptoms')}
          className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-black"
        >
          Go Back
        </button>
      </div>
    );
  }

  const riskStyles = {
    HIGH: {
      bg: lowBw ? 'bg-red-50' : 'bg-red-500',
      lightBg: 'bg-red-50',
      text: lowBw ? 'text-red-700' : 'text-white',
      border: 'border-red-200',
      icon: <AlertTriangle className={lowBw ? 'text-red-600' : 'text-white'} size={24} />
    },
    MEDIUM: {
      bg: lowBw ? 'bg-orange-50' : 'bg-orange-500',
      lightBg: 'bg-orange-50',
      text: lowBw ? 'text-orange-700' : 'text-white',
      border: 'border-orange-200',
      icon: <AlertCircle className={lowBw ? 'text-orange-600' : 'text-white'} size={24} />
    },
    LOW: {
      bg: lowBw ? 'bg-green-50' : 'bg-green-500',
      lightBg: 'bg-green-50',
      text: lowBw ? 'text-green-700' : 'text-white',
      border: 'border-green-200',
      icon: <ShieldCheck className={lowBw ? 'text-green-600' : 'text-white'} size={24} />
    }
  };

  const currentStyle = riskStyles[result.risk_level] || riskStyles.LOW;

  return (
    <div className={`min-h-screen ${lowBw ? 'bg-white' : 'bg-gray-50/50'} pb-40`}>
      {/* Header */}
      <div className={`px-6 py-6 border-b flex items-center justify-between ${
        lowBw ? 'bg-white border-gray-200' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/symptoms')} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <ArrowLeft size={24} className="text-gray-800" />
            </button>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Analysis Result</h1>
        </div>
        <button 
            onClick={handleShare}
            className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
        >
            <Share2 size={20} />
        </button>
      </div>

      <div className={`p-6 space-y-6 ${!lowBw && 'animate-in fade-in slide-in-from-bottom-4 duration-700'}`}>
        
        {/* OFFLINE INDICATOR */}
        {result.is_offline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-2xl w-fit text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200">
                <WifiOff size={12} />
                Offline mode: local AI used
            </div>
        )}

        {/* BIG RISK BANNER */}
        <div className={`${currentStyle.bg} p-8 rounded-[40px] ${currentStyle.text} flex items-center justify-between overflow-hidden relative ${
            !lowBw ? 'shadow-2xl' : 'border-2 ' + currentStyle.border
        }`}>
            {!lowBw && <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>}
            <div className="flex items-center gap-4 relative z-10">
                <div className={`${lowBw ? 'p-2 bg-transparent' : 'p-4 bg-white/20 backdrop-blur-md rounded-3xl'}`}>
                    {currentStyle.icon}
                </div>
                <div>
                   <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${lowBw ? 'opacity-60' : 'opacity-80'}`}>Assessment Result</p>
                   <h2 className="text-3xl font-black uppercase">{result.risk_level} RISK</h2>
                </div>
            </div>
            {!lowBw && (
                <div className="hidden md:block">
                    <Activity size={48} className="opacity-20" />
                </div>
            )}
        </div>

        {/* CONDITION & EXPLANATION */}
        <div className={`p-8 rounded-[40px] border border-gray-100 space-y-6 ${
            lowBw ? 'bg-white' : 'bg-white shadow-sm'
        }`}>
            <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Possible Condition</span>
                <h3 className="text-2xl font-black text-gray-800">{result.condition}</h3>
            </div>
            
            <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Detailed Explanation</span>
                <p className="text-gray-600 font-bold leading-relaxed">{result.explanation}</p>
            </div>
        </div>

        {/* RECOMMENDATION CARD */}
        <div className="bg-teal-50 p-8 rounded-[40px] border-2 border-teal-100 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 text-white rounded-xl">
                    <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-black text-teal-900">Abhi kya karein:</h3>
            </div>
            <p className="text-teal-800 font-bold leading-relaxed text-lg">{result.recommendation}</p>
        </div>

        {/* WARNING LINE */}
        {(result.risk_level === 'HIGH' || result.risk_level === 'MEDIUM') && (
            <div className={`p-6 border rounded-3xl flex gap-4 ${
                lowBw ? 'bg-white border-orange-200 text-orange-800' : 'bg-orange-50 border-orange-100 text-orange-700'
            }`}>
                <AlertTriangle className="shrink-0" size={20} />
                <p className="text-xs font-black uppercase tracking-wider leading-relaxed">
                    {language === 'hi' 
                        ? 'Agar symptoms badh jayein ya saans lene mein takleef ho, toh turant civil hospital jayein.'
                        : 'If symptoms worsen or you experience difficulty breathing, please visit the civil hospital immediately.'}
                </p>
            </div>
        )}

        {/* BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={handleTalkToDoctor}
                disabled={loading}
                className={`w-full text-white p-5 rounded-3xl font-black flex items-center justify-center gap-3 disabled:opacity-50 ${
                    lowBw ? 'bg-gray-900' : 'bg-purple-600 shadow-xl shadow-purple-200'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <PhoneCall size={20} />}
                Doctor Se Milein →
            </button>
            
            <button 
                onClick={() => navigate('/symptoms')}
                className="w-full bg-white border border-gray-200 text-gray-600 p-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
            >
                <RefreshCw size={20} />
                Dobara Check Karo
            </button>
        </div>

        {/* DISCLAIMER */}
        <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest px-8">
            {language === 'hi' 
                ? 'Yeh ek AI-based assessment hai. Kripya doctor ki salah zaroor lein.' 
                : 'This is an AI-based assessment. Please always consult a qualified doctor.'}
        </p>

      </div>

      {/* FIXED BOTTOM ACTION (If lowBw is off, it has backdrop blur) */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 z-50 border-t ${
        lowBw ? 'bg-white border-gray-200' : 'bg-white/80 backdrop-blur-xl border-gray-100'
      }`}>
          <button 
            onClick={handleTalkToDoctor}
            className={`w-full py-5 rounded-3xl font-black text-lg ${
                lowBw ? 'bg-gray-900 text-white' : 'bg-purple-600 text-white shadow-2xl shadow-purple-200'
            }`}
          >
             Connect to Specialist Now
          </button>
      </div>
    </div>
  );
}
