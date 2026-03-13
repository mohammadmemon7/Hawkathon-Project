import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Download,
  Phone,
  Video,
  ChevronLeft,
  FileText,
  User,
  Coffee,
  WifiOff,
  XCircle,
  Activity,
  Plus,
  FlaskConical,
  ExternalLink
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { 
  getTelemedSummary, 
  sendTelemedMessage, 
  getTelemedMessages,
  upsertPrescription,
  completeTelemedSession,
  addLabReport
} from '../services/api';

export default function ConsultationRoom() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lowBw, patient, currentDoctor } = useContext(AppContext);
  
  const isDoctor = !!currentDoctor;
  const [session, setSession] = useState(location.state?.session || null);
  const [messages, setMessages] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(!session);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState('00:00');
  const [isOffline, setIsOffline] = useState(false);
  
  const cacheKey = `sehatsetu_consult_cache_${id}`;
  // Doctor-only state for prescription editing
  const [editPresc, setEditPresc] = useState({
    medicines: [],
    instructions: '',
    follow_up: ''
  });
  const [diagnosis, setDiagnosis] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [savingPresc, setSavingPresc] = useState(false);
  const [record, setRecord] = useState(null);
  const [labReports, setLabReports] = useState([]);
  const [newLabReport, setNewLabReport] = useState({ file_name: '', file_type: 'Report', file_url: '' });
  const [addingReport, setAddingReport] = useState(false);
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      const summary = await getTelemedSummary(id);
      setSession(summary.session);
      setMessages(summary.messages);
      setPrescription(summary.prescription);
      setRecord(summary.record);
      // If record exists, summary should ideally include lab reports too? 
      // Current records API for patient returns them, but telemed summary doesn't yet.
      // For now, if record exists, we could fetch them or assume none initially.
      
      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
          session: summary.session,
          messages: summary.messages,
          prescription: summary.prescription,
          record: summary.record,
          timestamp: Date.now()
      }));

      if (summary.prescription) {
          setEditPresc({
              medicines: JSON.parse(summary.prescription.medicines || '[]'),
              instructions: summary.prescription.instructions || '',
              follow_up: summary.prescription.follow_up || ''
          });
      }
      setLoading(false);
      setError(null);
      setIsOffline(false);
    } catch (err) {
      console.error("Failed to fetch session summary:", err);
      // Try cache if offline or error
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
          const { session, messages, prescription } = JSON.parse(cached);
          setSession(session);
          setMessages(messages);
          setPrescription(prescription);
          setIsOffline(true);
          setLoading(false);
      } else {
        setError("Failed to load consultation room.");
        setLoading(false);
      }
    }
  };

  const updateMessages = async () => {
    try {
        const newMessages = await getTelemedMessages(id);
        setMessages(newMessages);
        setIsOffline(false);
        
        // Also refresh session status in case doctor accepted/completed
        if (session?.status !== 'completed') {
            const summary = await getTelemedSummary(id);
            setSession(summary.session);
            setPrescription(summary.prescription);
            setRecord(summary.record);
            
            // Update cache
            localStorage.setItem(cacheKey, JSON.stringify({
                session: summary.session,
                messages: newMessages,
                prescription: summary.prescription,
                record: summary.record,
                timestamp: Date.now()
            }));
        }
    } catch (err) {
        console.error("Polling error:", err);
        setIsOffline(true);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = lowBw ? 5000 : 2000;
    pollingRef.current = setInterval(updateMessages, interval);
    
    return () => clearInterval(pollingRef.current);
  }, [id, lowBw]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.started_at && session?.status !== 'completed') {
        const interval = setInterval(() => {
            const start = new Date(session.started_at).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);
            
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            setTimer(`${mins}:${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [session?.started_at, session?.status]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || sending || session?.status === 'completed') return;

    setSending(true);
    try {
      const role = isDoctor ? 'doctor' : 'patient';
      const newMsg = await sendTelemedMessage(id, role, msgInput.trim());
      setMessages(prev => [...prev, newMsg]);
      setMsgInput('');
    } catch (err) {
      console.error("Failed to send message:", err);
      if (err.status === 429) {
          alert("Slow down! Please wait a second before sending another message.");
      }
    } finally {
      setSending(false);
    }
  };

  const copyPrescription = () => {
    if (!prescription) return;
    const meds = JSON.parse(prescription.medicines || '[]').join(', ');
    const text = `Prescription: ${meds}\nInstructions: ${prescription.instructions}\nFollow-up: ${prescription.follow_up}`;
    navigator.clipboard.writeText(text);
    alert("Prescription copied to clipboard!");
  };

  const handleSavePrescription = async () => {
    setSavingPresc(true);
    try {
        const updated = await upsertPrescription(id, {
            doctor_id: currentDoctor.id,
            patient_id: session.patient_id,
            ...editPresc
        });
        setPrescription(updated);
        alert("Prescription updated successfully");
    } catch (err) {
        console.error("Prescription error:", err);
    } finally {
        setSavingPresc(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!diagnosis.trim()) {
        alert("Please enter a diagnosis before completing the session.");
        return;
    }
    if (!window.confirm("Confirm: Complete consultation and save record?")) return;
    
    try {
        const response = await completeTelemedSession(id, {
            doctor_id: currentDoctor.id,
            diagnosis: diagnosis.trim(),
            consultation_notes: consultationNotes.trim()
        });
        setSession(response.session);
        setRecord(response.record);
        alert("Success: Record saved to patient timeline.");
    } catch (err) {
        console.error("Completion error:", err);
        alert("Failed to complete session.");
    }
  };

  const handleAddLabReport = async (e) => {
    e.preventDefault();
    if (!record?.id || !newLabReport.file_name) return;
    setAddingReport(true);
    try {
        await addLabReport(record.id, newLabReport);
        setNewLabReport({ file_name: '', file_type: 'Report', file_url: '' });
        alert("Lab report added to record.");
        fetchData();
    } catch (err) {
        console.error("Lab report error:", err);
    } finally {
        setAddingReport(false);
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
              <div className={`w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full ${lowBw ? '' : 'animate-spin'}`}></div>
              <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Entering Consulting Room...</p>
          </div>
      </div>
  );

  if (error) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center">
          <div className="max-w-xs">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800">Connection Error</h3>
              <p className="text-gray-500 font-bold mt-2">{error}</p>
              <button 
                onClick={() => navigate('/doctors')}
                className="mt-6 px-8 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black"
              >
                Back to Directory
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/doctors')} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                    <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <div className="relative">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-black">
                        {session.doctor_name[0]}
                    </div>
                </div>
                <div>
                    <h1 className="font-black text-gray-800 leading-none">
                        {isDoctor ? `Patient: ${session.patient_name}` : `Dr. ${session.doctor_name}`}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Consultation Room</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    session.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                    session.status === 'active' ? 'bg-green-100 text-green-600' :
                    `bg-purple-100 text-purple-600 ${lowBw ? '' : 'animate-pulse'}`
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        session.status === 'completed' ? 'bg-gray-400' :
                        session.status === 'active' ? 'bg-green-500' :
                        'bg-purple-500'
                    }`}></div>
                    {session.status}
                </div>
                {session.started_at && session.status !== 'completed' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-black">
                        <Clock size={12} />
                        {timer}
                    </div>
                )}
                {isDoctor && session.status !== 'completed' && (
                    <button 
                        onClick={handleCompleteSession}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                    >
                        End Session
                    </button>
                )}
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* MAIN / CHAT SECTION */}
        <main className="flex-1 flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            {/* SESSION INFO BAR */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600">
                        {session.mode === 'chat' ? <MessageSquare size={24} /> : 
                         session.mode === 'audio' ? <Phone size={24} /> : <Video size={24} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{session.mode} Session</p>
                        <p className="font-black text-gray-800">
                            {session.status === 'requested' ? "Waiting for doctor to join..." : 
                             session.status === 'accepted' ? "Doctor has accepted" :
                             session.status === 'active' ? "Clinician is reviewing" : "Consultation finished"}
                        </p>
                    </div>
                </div>

                {isOffline && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 font-black text-[10px] uppercase tracking-widest">
                        <WifiOff size={14} />
                        Offline - Viewing Cached Data
                    </div>
                )}

                {(session.mode === 'audio' || session.mode === 'video') && session.meeting_code && (
                    <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Meeting Code</p>
                        <p className="text-lg font-black text-amber-700 tracking-[0.2em]">{session.meeting_code}</p>
                    </div>
                )}
            </div>

            {/* MESSAGE LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                    <p className="font-bold text-gray-500">
                        {isDoctor ? "Aap patient ke saath chat shuru kar sakte hain." : "Aapka consultation shuru ho gaya hai. Doctor ko apna haal batayein."}
                    </p>
                </div>
                ) : (
                    messages.map((m, i) => (
                        <div key={m.id} className={`flex ${m.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-3xl ${
                                m.sender_type === 'patient' 
                                ? 'bg-purple-600 text-white rounded-tr-none' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                                <p className="text-sm font-bold">{m.message}</p>
                                <p className={`text-[9px] mt-1 font-black uppercase tracking-widest ${
                                    m.sender_type === 'patient' ? 'opacity-50' : 'text-gray-400'
                                }`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT */}
            {session.status !== 'completed' && (
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    {isOffline ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-center font-black text-xs uppercase tracking-widest">
                             Offline: message send nahi ho sakta
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="p-2 bg-white rounded-[32px] border border-gray-200 shadow-sm flex items-center gap-2">
                            <input 
                                type="text"
                                placeholder="Type your message..."
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                disabled={sending}
                                className="flex-1 bg-transparent px-6 py-3 outline-none font-bold text-gray-700"
                            />
                            <button 
                                type="submit"
                                disabled={sending || !msgInput.trim()}
                                className="w-12 h-12 bg-purple-600 text-white rounded-[24px] flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </main>

        {/* RIGHT PANEL - PRESCRIPTION */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-black text-gray-800">Prescription</h3>
                </div>

                {isDoctor && session.status !== 'completed' ? (
                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Medicines</label>
                            <div className="space-y-2">
                                {editPresc.medicines.map((m, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input 
                                            value={m}
                                            onChange={(e) => {
                                                const newMeds = [...editPresc.medicines];
                                                newMeds[i] = e.target.value;
                                                setEditPresc(prev => ({ ...prev, medicines: newMeds }));
                                            }}
                                            className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold font-sans"
                                        />
                                        <button 
                                            onClick={() => setEditPresc(prev => ({ ...prev, medicines: prev.medicines.filter((_, idx) => idx !== i) }))}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setEditPresc(prev => ({ ...prev, medicines: [...prev.medicines, ''] }))}
                                    className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all"
                                >
                                    + Add Medicine
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Instructions</label>
                            <textarea 
                                value={editPresc.instructions}
                                onChange={(e) => setEditPresc(prev => ({ ...prev, instructions: e.target.value }))}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 min-h-[80px]"
                                placeholder="Taking timing, precautions..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Follow-up</label>
                            <input 
                                value={editPresc.follow_up}
                                onChange={(e) => setEditPresc(prev => ({ ...prev, follow_up: e.target.value }))}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none"
                                placeholder="After 1 week..."
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Final Record</h4>
                            
                            <div className="mb-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Diagnosis *</label>
                                <input 
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold outline-none ring-purple-600/20 focus:ring-2"
                                    placeholder="Final diagnosis..."
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Clinical Notes</label>
                                <textarea 
                                    value={consultationNotes}
                                    onChange={(e) => setConsultationNotes(e.target.value)}
                                    className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold outline-none ring-purple-600/20 focus:ring-2 min-h-[100px]"
                                    placeholder="Patient condition, exams, history..."
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSavePrescription}
                            disabled={savingPresc}
                            className="mt-2 w-full py-4 bg-blue-600 text-white rounded-3xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-blue-200"
                        >
                            <ShieldCheck size={16} />
                            {savingPresc ? "Saving..." : "Save Prescription"}
                        </button>
                    </div>
                ) : !prescription ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-12">
                        <Activity className="mb-4" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest">No Active Prescription</p>
                    </div>
                ) : (
                    <div className="flex-1 space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Medicines</h4>
                            <div className="space-y-2">
                                {JSON.parse(prescription.medicines || '[]').map((med, i) => (
                                    <div key={i} className="px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="font-black text-blue-900 text-xs">{med}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Instructions</h4>
                            <p className="text-sm font-bold text-gray-700">{prescription.instructions}</p>
                        </div>

                        {prescription.follow_up && (
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Follow-up</h4>
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-800">
                                    {prescription.follow_up}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={copyPrescription}
                            className="mt-4 w-full py-4 bg-gray-900 text-white rounded-3xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                            <Download size={14} />
                            Download
                        </button>
                    </div>
                )}

                {/* LAB REPORTS FOR DOCTOR (POST-COMPLETION) */}
                {isDoctor && record && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <FlaskConical size={16} />
                            </div>
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Lab Report Management</h4>
                        </div>

                        <form onSubmit={handleAddLabReport} className="space-y-3">
                            <input 
                                placeholder="File Name (e.g. Blood Test)"
                                value={newLabReport.file_name}
                                onChange={(e) => setNewLabReport(prev => ({ ...prev, file_name: e.target.value }))}
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                            />
                            <div className="flex gap-2">
                                <input 
                                    placeholder="File URL (Optional)"
                                    value={newLabReport.file_url}
                                    onChange={(e) => setNewLabReport(prev => ({ ...prev, file_url: e.target.value }))}
                                    className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold outline-none"
                                />
                                <button 
                                    type="submit"
                                    disabled={addingReport || !newLabReport.file_name}
                                    className="px-4 bg-purple-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mt-8 p-4 bg-purple-50 rounded-3xl border border-purple-100 flex items-center gap-4">
                    <div className="w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} />
                    </div>
                    <p className="text-[9px] font-bold text-purple-700 leading-snug">
                        Dawai lene se pehle apne kisi pass ke hospital ya pharmacy se confirm zaroor karein.
                    </p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
