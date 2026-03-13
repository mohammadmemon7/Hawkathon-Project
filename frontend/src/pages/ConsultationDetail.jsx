import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Activity, 
  ClipboardList, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  Phone
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getConsultation, updateConsultation, completeConsultation } from '../services/api';
import TriageCard from '../components/TriageCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PRESCRIPTION_TEMPLATES = [
  { name: 'Common Cold', text: 'Paracetamol 500mg (1-0-1), Cetirizine 10mg (0-0-1), Rest & Fluids' },
  { name: 'Stomach Pain', text: 'Dicyclomine 10mg (as needed), Antacid Gel (10ml before food), Soft diet' },
  { name: 'Fever', text: 'Paracetamol 650mg (1-1-1), Monitor temperature, Hydration' },
  { name: 'Skin Rash', text: 'Calamine Lotion (apply twice daily), Cetirizine 10mg (0-0-1)' }
];

export default function ConsultationDetail() {
  const { id } = useParams();
  const { currentDoctor, language } = useContext(AppContext);
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConsultation(id);
        setConsultation(data);
        setDoctorNotes(data.doctor_notes || '');
        setPrescription(data.prescription || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleComplete = async () => {
    setSaving(true);
    setStatus('saving');
    try {
      await updateConsultation(id, { doctor_notes: doctorNotes, prescription });
      await completeConsultation(id, currentDoctor?.id);
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (text) => {
    setPrescription(prev => prev ? `${prev}\n${text}` : text);
  };

  if (loading) return <LoadingSpinner />;
  if (!consultation) return <div className="p-8 text-center text-gray-400">Consultation not found</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
         <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold transition-all"
         >
           <ArrowLeft size={20} />
           <span>Back to Dashboard</span>
         </button>
         
         <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                consultation.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
                {consultation.status}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Patient Info & Symptoms */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-2xl border border-purple-100">
                    {consultation.patient_name.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-gray-800">{consultation.patient_name}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">PID: {consultation.patient_id}</p>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Demographics</span>
                    <span className="font-bold text-gray-700">{consultation.patient_age}y, {consultation.patient_gender}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Location</span>
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                       <MapPin size={14} className="text-purple-400" />
                       {consultation.patient_village}
                    </div>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Contact</span>
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                       <Phone size={14} className="text-purple-400" />
                       {consultation.patient_phone}
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-purple-600 rounded-3xl p-6 text-white space-y-4">
              <div className="flex items-center gap-2 opacity-80">
                 <ClipboardList size={20} />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em]">Patient Complaints</h3>
              </div>
              <p className="text-lg font-bold leading-relaxed">{consultation.symptoms}</p>
           </div>
        </div>

        {/* Right: AI Triage & Treatment */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* AI Insight Card */}
           <div className="bg-white rounded-3xl border-2 border-dashed border-teal-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="p-8 relative">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-200">
                       <Activity size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-800">AI Diagnostic Insight</h3>
                 </div>
                 <TriageCard
                    level={consultation.ai_triage_level}
                    explanation={consultation.ai_explanation}
                    action={consultation.ai_action}
                    remedies={consultation.ai_remedies}
                    warning={consultation.ai_warning}
                 />
              </div>
           </div>

           {/* Treatment Form */}
           <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-900/5 p-8 space-y-8">
              <div className="space-y-4">
                 <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <FileText size={14} />
                    Consultation Clinical Notes
                 </label>
                 <textarea 
                    rows="4"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Document your clinical findings, observations, and advice..."
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 outline-none font-medium text-gray-700 transition-all resize-none"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <PlusCircle size={14} />
                        Prescription (Medicine & Dosage)
                    </label>
                    <div className="flex gap-2">
                        {PRESCRIPTION_TEMPLATES.map(t => (
                            <button 
                                key={t.name}
                                onClick={() => applyTemplate(t.text)}
                                className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                            >
                                + {t.name}
                            </button>
                        ))}
                    </div>
                 </div>
                 <textarea 
                    rows="3"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Enter medicine names, strength, and frequency (e.g. Paracetamol 500mg 1-0-1)..."
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 outline-none font-bold text-teal-800 transition-all resize-none placeholder:font-normal placeholder:text-gray-400"
                 />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-4">
                 <button 
                  onClick={handleComplete}
                  disabled={saving || consultation.status === 'completed'}
                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                      status === 'success' 
                      ? 'bg-green-500 text-white shadow-green-200' 
                      : 'bg-purple-600 text-white shadow-purple-500/20'
                  }`}
                 >
                    {saving ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 /> : <CheckCircle2 />}
                    <span>{status === 'success' ? 'Consultation Fixed!' : 'Complete Consultation'}</span>
                 </button>
              </div>

              {status === 'error' && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-bounce">
                    <AlertTriangle size={20} />
                    <p className="text-sm font-bold uppercase tracking-widest">Save failed. Check connection.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
