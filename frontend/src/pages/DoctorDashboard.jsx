import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Video, 
  Phone, 
  MessageSquare,
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Activity,
  UserPlus,
  Power,
  ClipboardList,
  Clock,
  MapPin
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { 
  getPendingConsultations, 
  getPendingCalls, 
  acceptCall, 
  completeCall, 
  toggleDoctorAvailability,
  getDoctorAppointments,
  getDoctorTelemedSessions,
  acceptTelemedSession
} from '../services/api';
import PatientCard from '../components/PatientCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorDashboard() {
  const { currentDoctor, setCurrentDoctor } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('triage'); // triage, calls, appointments
  const [consultations, setConsultations] = useState([]);
  const [calls, setCalls] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [telemedSessions, setTelemedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchData = useCallback(async (showSpinner) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [consRes, callsRes, apptsRes, telemedRes] = await Promise.all([
        getPendingConsultations(1, 100),
        getPendingCalls(),
        getDoctorAppointments(currentDoctor.id),
        getDoctorTelemedSessions(currentDoctor.id, 'requested')
      ]);
      setConsultations(Array.isArray(consRes) ? consRes : (consRes.data || []));
      setCalls(callsRes);
      setTelemedSessions(telemedRes);
      // Filter today's appointments for the dashboard
      const today = new Date().toISOString().split('T')[0];
      setAppointments(apptsRes.filter(a => a.appointment_date === today));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentDoctor?.id]);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(false), 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleAvailability = async () => {
    try {
      const updated = await toggleDoctorAvailability(currentDoctor.id);
      setCurrentDoctor(updated);
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  const handleAcceptCall = async (id) => {
    try {
      const res = await acceptCall(id);
      alert(`Meeting started. Code: ${res.meeting_code}`);
      fetchData(false);
    } catch (err) {
      alert("Failed to accept call");
    }
  };

  const handleCompleteCall = async (id) => {
    try {
      await completeCall(id);
      fetchData(false);
    } catch (err) {
      alert("Failed to complete call");
    }
  };

  const handleAcceptTelemedSession = async (sessionId) => {
    try {
        const accepted = await acceptTelemedSession(sessionId, currentDoctor.id);
        navigate(`/consult/${sessionId}`, { state: { session: accepted } });
    } catch (err) {
        console.error("Failed to accept telemed session:", err);
        alert("Failed to accept session.");
    }
  };

  // Memoized Filtered Consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const matchesSearch = c.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVillage = villageFilter === 'All' || c.patient_village === villageFilter;
      const matchesPriority = priorityFilter === 'All' || c.priority_score.toString() === priorityFilter;
      return matchesSearch && matchesVillage && matchesPriority;
    });
  }, [consultations, searchTerm, villageFilter, priorityFilter]);

  // Unique villages for filter
  const villages = useMemo(() => {
    const v = new Set(consultations.map(c => c.patient_village));
    return ['All', ...Array.from(v)];
  }, [consultations]);

  if (!currentDoctor) return null;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      {/* Top Bar: Profile & Availability */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-purple-600/20">
            {currentDoctor.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Dr. {currentDoctor.name}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentDoctor.specialization}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Availability Toggle */}
           <button 
              onClick={handleToggleAvailability}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                currentDoctor.available 
                ? 'bg-green-50 border-green-200 text-green-700 shadow-lg shadow-green-100' 
                : 'bg-red-50 border-red-200 text-red-600 grayscale'
              }`}
           >
              <Power size={18} />
              <span>{currentDoctor.available ? 'AVAILABLE' : 'OFFLINE'}</span>
           </button>
           
           <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-3 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
           >
            <RefreshCw size={24} className={`text-purple-600 ${refreshing ? 'animate-spin' : 'group-active:rotate-180 transition-transform'}`} />
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/50 p-2 rounded-2xl border border-gray-100 w-fit">
         {[
           { id: 'triage', label: 'Triage Queue', icon: <Activity size={18} />, count: consultations.length },
           { id: 'telemed', label: 'Telemedicine', icon: <MessageSquare size={18} />, count: telemedSessions.length },
           { id: 'calls', label: 'Call Requests', icon: <Video size={18} />, count: calls.length },
           { id: 'appointments', label: 'Today\'s Schedule', icon: <Calendar size={18} />, count: appointments.length }
         ].map(tab => (
           <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
              : 'text-gray-500 hover:bg-white hover:text-purple-600'
            }`}
           >
             {tab.icon}
             <span>{tab.label}</span>
             {tab.count > 0 && (
               <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                 activeTab === tab.id ? 'bg-white text-purple-600' : 'bg-gray-100 text-gray-500'
               }`}>
                 {tab.count}
               </span>
             )}
           </button>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* TRIAGE QUEUE TAB */}
        {activeTab === 'triage' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
               {/* Search */}
               <div className="relative flex-1 group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                 <input 
                  type="text" 
                  placeholder="Search patient name or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 transition-all font-medium"
                 />
               </div>

               {/* Filters */}
               <div className="flex gap-2">
                 <select 
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-sm text-gray-700 appearance-none min-w-[140px]"
                 >
                   {villages.map(v => <option key={v} value={v}>{v === 'All' ? 'All Villages' : v}</option>)}
                 </select>
                 
                 <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-purple-500/10 font-bold text-sm text-gray-700 appearance-none min-w-[140px]"
                 >
                    <option value="All">All Priority</option>
                    <option value="3">Emergency Only</option>
                    <option value="2">High Priority</option>
                    <option value="1">Routine</option>
                 </select>
               </div>
            </div>

            {filteredConsultations.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <ClipboardList size={64} className="mx-auto mb-6 text-gray-200" />
                <h3 className="text-xl font-black text-gray-800 mb-2">Queue is Empty</h3>
                <p className="text-gray-400 font-medium">Try adjusting your filters or wait for new consultations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConsultations.map((c) => (
                  <PatientCard
                    key={c.id}
                    consultation={c}
                    onReview={(id) => navigate(`/consultation/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TELEMEDICINE TAB */}
        {activeTab === 'telemed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {telemedSessions.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <MessageSquare size={64} className="mx-auto mb-6 text-gray-200" />
                <h3 className="text-xl font-black text-gray-800 mb-2">No Telemed Requests</h3>
                <p className="text-gray-400 font-medium">Remote consultation requests will appear here.</p>
              </div>
            ) : (
                telemedSessions.map(session => (
                    <div key={session.id} className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm shadow-purple-900/5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    {session.mode === 'chat' ? <MessageSquare size={22} /> : 
                                     session.mode === 'audio' ? <Phone size={22} /> : <Video size={22} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800">{session.patient_name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{session.mode} Consultation</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                REQUESTED
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAcceptTelemedSession(session.id)}
                                className="flex-1 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all uppercase tracking-widest"
                            >
                                Accept & Join
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        )}

        {/* CALL REQUESTS TAB */}
        {activeTab === 'calls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calls.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <Video size={64} className="mx-auto mb-6 text-gray-200" />
                <h3 className="text-xl font-black text-gray-800 mb-2">No Call Requests</h3>
                <p className="text-gray-400 font-medium">Patients will appear here when they request a consultation.</p>
              </div>
            ) : (
              calls.map((call) => (
                <div key={call.id} className={`bg-white rounded-3xl p-6 border transition-all hover:shadow-xl ${
                  call.status === 'accepted' ? 'border-green-200 bg-green-50/10 shadow-green-900/5' : 'border-purple-50 shadow-purple-900/5'
                }`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                         call.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {call.mode === 'video' ? <Video size={22} /> : <Phone size={22} />}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-800">{call.patient_name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{call.mode} call requested</p>
                      </div>
                    </div>
                    {call.status === 'pending' && (
                       <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {call.status === 'pending' ? (
                      <button 
                        onClick={() => handleAcceptCall(call.id)}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
                      >
                        Accept Call
                      </button>
                    ) : (
                      <div className="flex-1 flex flex-col gap-2">
                         <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-center text-xs font-black uppercase">Active: {call.meeting_code}</div>
                         <button 
                          onClick={() => handleCompleteCall(call.id)}
                          className="flex-1 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all"
                         >
                           End Session
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
                <Calendar size={64} className="mx-auto mb-6 text-gray-200" />
                <h3 className="text-xl font-black text-gray-800 mb-2">No Appointments Today</h3>
                <p className="text-gray-400 font-medium">Today's scheduled visits will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl">
                            {apt.patient_name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-gray-800">{apt.patient_name}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                               <MapPin size={12} />
                               PID: {apt.patient_id}
                            </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-purple-600 font-black">
                           <Clock size={18} />
                           <span>{apt.appointment_time}</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reason</span>
                           <p className="text-sm font-bold text-gray-700">{apt.reason || 'General Checkup'}</p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-purple-200">Start Visit</button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
