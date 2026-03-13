import { useState, useEffect, useContext } from 'react';
import { 
  UserPlus, 
  Activity, 
  Stethoscope, 
  ClipboardList, 
  Search, 
  Thermometer, 
  Heart, 
  Droplets, 
  Wind,
  CheckCircle,
  AlertCircle,
  Clock,
  Navigation,
  ChevronRight,
  LogOut,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { 
  loginHealthWorker, 
  registerPatientByWorker, 
  uploadPatientVitals, 
  findPatientByPhone,
  getWorkerHistory,
  createTelemedSession
} from '../services/api';
import { AppContext } from '../context/AppContext';

export default function HealthWorkerDashboard() {
  const { language, currentDoctor, currentPatient } = useContext(AppContext);
  const [worker, setWorker] = useState(null);
  const [loginData, setLoginData] = useState({ code: '', pass: '' });
  const [activeTab, setActiveTab] = useState('register'); // register | vitals | history

  // Form State
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', phone: '', village: '' });
  const [vitals, setVitals] = useState({ 
    patient_id: '', 
    temp: '', 
    sys: '', 
    dia: '', 
    pulse: '', 
    spo2: '', 
    notes: '' 
  });
  const [searchResults, setSearchResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const t = {
    title: language === 'hi' ? 'ASHA / स्वास्थ्य कार्यकर्ता डैशबोर्ड' : 'Village Health Worker Dashboard',
    login: language === 'hi' ? 'लॉगिन करें' : 'Worker Login',
    workerId: language === 'hi' ? 'कार्यकर्ता आईडी' : 'Worker ID (e.g. ASHA-101)',
    pass: language === 'hi' ? 'पासवर्ड' : 'Password',
    regPatient: language === 'hi' ? 'मरीज का पंजीकरण' : 'Register Patient',
    addVitals: language === 'hi' ? 'वाइटल्स (vitals) अपलोड करें' : 'Upload Vitals',
    history: language === 'hi' ? 'कार्य इतिहास' : 'My History',
    searchHint: language === 'hi' ? 'मरीज का फोन नंबर खोजें' : 'Search patient by phone',
    temp: language === 'hi' ? 'तापमान (°F)' : 'Temp (°F)',
    bp: language === 'hi' ? 'ब्लड प्रेशर (Sys/Dia)' : 'BP (Sys/Dia)',
    pulse: language === 'hi' ? 'पल्स (BPM)' : 'Pulse (BPM)',
    spo2: language === 'hi' ? 'सुगर (Oxygen %)' : 'Oxygen (SpO2 %)',
    requestConsult: language === 'hi' ? 'डॉक्टर से परामर्श मांगें' : 'Request Consultation',
    successReg: language === 'hi' ? 'मरीज का पंजीकरण सफल!' : 'Patient registered successfully!',
    successVitals: language === 'hi' ? 'वाइटल्स (Vitals) सुरक्षित कर लिए गए' : 'Vitals recorded successfully!',
  };

  useEffect(() => {
    const saved = localStorage.getItem('sehatsetu_worker');
    if (saved) {
        const w = JSON.parse(saved);
        setWorker(w);
        fetchHistory(w.id);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const data = await loginHealthWorker(loginData.code, loginData.pass);
        setWorker(data);
        localStorage.setItem('sehatsetu_worker', JSON.stringify(data));
        fetchHistory(data.id);
    } catch (err) {
        alert("Invalid ID or Password");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    setWorker(null);
    localStorage.removeItem('sehatsetu_worker');
  };

  const fetchHistory = async (id) => {
    try {
        const data = await getWorkerHistory(id);
        setHistory(data);
    } catch (e) {}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const patient = await registerPatientByWorker(newPatient);
        alert(t.successReg);
        // Auto switch to vitals with this patient
        setVitals(prev => ({ ...prev, patient_id: patient.id }));
        setSearchResults(patient);
        setActiveTab('vitals');
        setNewPatient({ name: '', age: '', gender: 'Male', phone: '', village: '' });
    } catch (err) {
        alert("Registration failed");
    } finally {
        setLoading(false);
    }
  };

  const handleSearchPatient = async (phone) => {
    if (!phone) return;
    try {
        const p = await findPatientByPhone(phone);
        setSearchResults(p);
        setVitals(prev => ({ ...prev, patient_id: p.id }));
    } catch (err) {
        alert("Patient not found. Please register first.");
    }
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    if (!vitals.patient_id) return alert("Please select a patient first.");
    setLoading(true);
    try {
        await uploadPatientVitals({
            patient_id: vitals.patient_id,
            worker_id: worker.id,
            temperature: parseFloat(vitals.temp),
            bp_sys: parseInt(vitals.sys),
            bp_dia: parseInt(vitals.dia),
            pulse: parseInt(vitals.pulse),
            spo2: parseInt(vitals.spo2),
            notes: vitals.notes
        });
        alert(t.successVitals);
        fetchHistory(worker.id);
        setActiveTab('history');
    } catch (err) {
        alert("Failed to save vitals");
    } finally {
        setLoading(false);
    }
  };

  const handleRequestConsultation = async () => {
    if (!searchResults) return;
    try {
        // Auto-request a chat consultation for the patient
        await createTelemedSession({
            patient_id: searchResults.id,
            mode: 'chat'
        });
        alert("Consultation requested for " + searchResults.name);
    } catch (err) {
        alert("Failed to request consultation");
    }
  };

  if (!worker) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-200 border border-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <User size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t.title}</h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{t.login}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.workerId}</label>
                        <input 
                            value={loginData.code}
                            onChange={e => setLoginData({...loginData, code: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 font-bold transition-all"
                            placeholder="ASHA-101"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t.pass}</label>
                        <input 
                            type="password"
                            value={loginData.pass}
                            onChange={e => setLoginData({...loginData, pass: e.target.value})}
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 font-bold transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : t.login}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
        {/* Navbar */}
        <nav className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{worker.name}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <Navigation size={10} />
                            {worker.village} Village Unit
                        </div>
                    </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Quick Actions / Tabs */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { id: 'register', label: t.regPatient, icon: <UserPlus />, color: 'blue' },
                    { id: 'vitals', label: t.addVitals, icon: <Activity />, color: 'rose' },
                    { id: 'history', label: t.history, icon: <ClipboardList />, color: 'indigo' }
                ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`p-6 rounded-[32px] flex flex-col items-center gap-4 transition-all border-2 ${activeTab === item.id ? `bg-${item.color}-600 border-${item.color}-600 text-white shadow-xl shadow-${item.color}-100` : 'bg-white border-white text-slate-400 hover:border-slate-100 hover:bg-slate-50'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-sm border border-slate-100 min-h-[500px]">
                {activeTab === 'register' && (
                    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-10">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.regPatient}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Digital Health Enrollment</p>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                                <input 
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                                    placeholder="e.g. Rahul Kumar"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone Number</label>
                                <input 
                                    value={newPatient.phone}
                                    onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                                    placeholder="10 digit mobile"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Age</label>
                                <input 
                                    type="number"
                                    value={newPatient.age}
                                    onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                                    placeholder="e.g. 45"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Village</label>
                                <input 
                                    value={newPatient.village}
                                    onChange={e => setNewPatient({...newPatient, village: e.target.value})}
                                    placeholder="Village Name"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    required
                                />
                            </div>
                            <button className="md:col-span-2 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all">
                                Complete Registration
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 pb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-[20px] flex items-center justify-center">
                                    <Activity size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.addVitals}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Biometric Data Entry</p>
                                </div>
                            </div>

                            <div className="relative group w-full md:w-80">
                                <input 
                                    placeholder={t.searchHint}
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    onBlur={(e) => handleSearchPatient(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                    <Search size={20} />
                                </div>
                            </div>
                        </div>

                        {searchResults && (
                            <div className="flex items-center justify-between p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-sm font-black">
                                        {searchResults.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800">{searchResults.name}</h4>
                                        <p className="text-xs font-bold text-rose-600/70">{searchResults.age}y • {searchResults.village}</p>
                                    </div>
                                </div>
                                <button 
                                  onClick={handleRequestConsultation}
                                  className="px-6 py-3 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                >
                                    {t.requestConsult}
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleVitalsSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Thermometer size={14} className="text-blue-500" />
                                    {t.temp}
                                </label>
                                <input 
                                    type="number" step="0.1"
                                    value={vitals.temp}
                                    onChange={e => setVitals({...vitals, temp: e.target.value})}
                                    placeholder="98.6"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Heart size={14} className="text-rose-500" />
                                    {t.pulse}
                                </label>
                                <input 
                                    type="number"
                                    value={vitals.pulse}
                                    onChange={e => setVitals({...vitals, pulse: e.target.value})}
                                    placeholder="72"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Wind size={14} className="text-blue-400" />
                                    Oxygen (SpO2)
                                </label>
                                <input 
                                    type="number"
                                    value={vitals.spo2}
                                    onChange={e => setVitals({...vitals, spo2: e.target.value})}
                                    placeholder="98"
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    required
                                />
                            </div>
                             <div className="space-y-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                        <Droplets size={14} className="text-rose-600" />
                                        BP (Sys/Dia)
                                    </label>
                                </div>
                                <input 
                                    type="number"
                                    value={vitals.sys}
                                    onChange={e => setVitals({...vitals, sys: e.target.value})}
                                    placeholder="120"
                                    className="p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none focus:ring-4 focus:ring-rose-500/5 transition-all text-center"
                                />
                                <input 
                                    type="number"
                                    value={vitals.dia}
                                    onChange={e => setVitals({...vitals, dia: e.target.value})}
                                    placeholder="80"
                                    className="p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black outline-none focus:ring-4 focus:ring-rose-500/5 transition-all text-center"
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observations (Optional)</label>
                                <textarea 
                                    value={vitals.notes}
                                    onChange={e => setVitals({...vitals, notes: e.target.value})}
                                    placeholder="Symptoms or behavior..."
                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] font-bold outline-none h-32 focus:ring-4 focus:ring-rose-500/5 transition-all"
                                />
                            </div>
                            <button className="md:col-span-4 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                                <CheckCircle size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                Save & Secure Vitals
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10">
                         <div className="flex items-center gap-4 border-b border-slate-50 pb-10">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center">
                                <ClipboardList size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t.history}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Recent Community Visits</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {history.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center gap-4">
                                     <Clock size={48} className="text-slate-200" />
                                     <p className="font-black text-slate-300 uppercase tracking-widest text-xs">No entries recorded yet</p>
                                </div>
                            ) : (
                                history.map((row) => (
                                    <div key={row.id} className="p-6 bg-white border border-slate-100 rounded-[32px] hover:shadow-xl hover:shadow-indigo-900/5 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <span className="text-lg font-black">{new Date(row.created_at).getDate()}</span>
                                                <span className="text-[8px] font-black uppercase">{new Date(row.created_at).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-800">{row.patient_name}</h4>
                                                <div className="flex flex-wrap gap-4 mt-1">
                                                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Thermometer size={12} className="text-blue-500" />
                                                        {row.temperature}°F
                                                     </div>
                                                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Heart size={12} className="text-rose-500" />
                                                        {row.pulse} BPM
                                                     </div>
                                                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Wind size={12} className="text-blue-400" />
                                                        {row.spo2}% SpO2
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{row.bp_sys}/{row.bp_dia}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase">Blood Pressure</p>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100"></div>
                                            <ChevronRight className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* Floating Mobile Nav Overlay */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-slate-900/90 backdrop-blur-xl text-white py-3 px-8 rounded-full flex items-center gap-10 shadow-2xl border border-white/10">
             <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black uppercase text-slate-400">Synced</span>
                <CheckCircle size={14} className="text-emerald-400" />
             </div>
             <div className="w-px h-6 bg-white/10"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">{worker.worker_id_code}</p>
             <div className="w-px h-6 bg-white/10"></div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black uppercase text-slate-400">Status</span>
                <span className="text-[10px] font-black text-blue-400">ONLINE</span>
             </div>
        </div>
    </div>
  );
}
