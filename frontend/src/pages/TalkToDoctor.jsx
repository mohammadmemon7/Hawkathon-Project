import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors, requestCall, getPatientCalls } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  User, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export default function TalkToDoctor() {
  const { currentPatient, language } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [myCalls, setMyCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const t = {
    title: language === 'hi' ? 'डॉक्टर से बात करें' : 'Talk to Doctor',
    subtitle: language === 'hi' ? 'वीडियो या ऑडियो कॉल के लिए अनुरोध करें' : 'Request for a Video or Audio call',
    availableDoctors: language === 'hi' ? 'उपलब्ध डॉक्टर' : 'Available Doctors',
    waitingRoom: language === 'hi' ? 'प्रतीक्षा कक्ष (Waiting Room)' : 'Your Waiting Room',
    requestAudio: language === 'hi' ? 'ऑडियो कॉल' : 'Audio Call',
    requestVideo: language === 'hi' ? 'वीडियो कॉल' : 'Video Call',
    pending: language === 'hi' ? 'लंबित' : 'Pending',
    accepted: language === 'hi' ? 'स्वीकार्य' : 'Accepted',
    completed: language === 'hi' ? 'पूर्ण' : 'Completed',
    meetingCode: language === 'hi' ? 'मीटिंग कोड' : 'Meeting Code',
    copyCode: language === 'hi' ? 'कोड कॉपी करें' : 'Copy Code',
    waitingMsg: language === 'hi' ? 'डॉक्टर जल्द ही आपके अनुरोध को स्वीकार करेंगे...' : 'Doctor will accept your request soon...',
    readyMsg: language === 'hi' ? 'डॉक्टर तैयार हैं! कृपया नीचे दिए गए कोड का उपयोग करें।' : 'Doctor is ready! Please use the code below.',
    noDoctors: language === 'hi' ? 'फिलहाल कोई डॉक्टर उपलब्ध नहीं है' : 'No doctors available right now',
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const [docs, calls] = await Promise.all([
        getAvailableDoctors(),
        getPatientCalls(currentPatient.id)
      ]);
      setDoctors(docs);
      setMyCalls(calls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPatient?.id]);

  useEffect(() => {
    fetchInitialData();
    // Poll for status updates every 5 seconds
    const interval = setInterval(() => {
        getPatientCalls(currentPatient.id).then(setMyCalls).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchInitialData, currentPatient?.id]);

  const handleRequest = async (docId, mode) => {
    setRequesting(true);
    try {
      await requestCall({
        patient_id: currentPatient.id,
        doctor_id: docId,
        mode,
        notes: ''
      });
      fetchInitialData();
    } catch (err) {
      alert(language === 'hi' ? 'अनुरोध विफल रहा' : 'Request failed');
    } finally {
      setRequesting(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      
      {/* Active/Pending Calls Section */}
      {myCalls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="text-teal-600" size={20} />
            <h2 className="text-xl font-bold text-gray-800">{t.waitingRoom}</h2>
          </div>
          
          <div className="grid gap-4">
            {myCalls.filter(c => c.status !== 'completed').map((call) => (
              <div key={call.id} className={`bg-white rounded-3xl border-2 p-6 shadow-sm transition-all ${
                call.status === 'accepted' ? 'border-green-200 bg-green-50/10' : 'border-teal-100'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                       call.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-teal-100 text-teal-600'
                    }`}>
                      {call.mode === 'video' ? <Video size={28} /> : <Phone size={28} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800">Dr. {call.doctor_name}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        {call.mode} consultation
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3">
                    {call.status === 'pending' ? (
                      <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl border border-teal-100">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                        <span className="text-sm font-black uppercase">{t.pending}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-green-200">
                          <CheckCircle2 size={16} />
                          <span className="text-sm font-black uppercase">{t.accepted}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {call.status === 'accepted' && (
                  <div className="mt-6 p-4 bg-white border border-green-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <Info size={16} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">{t.readyMsg}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl font-mono font-bold text-teal-700 tracking-wider">
                            {call.meeting_code}
                        </div>
                        <button className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                            <Copy size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold shadow-lg shadow-teal-200">
                            <span>Join</span>
                            <ExternalLink size={16} />
                        </button>
                    </div>
                  </div>
                )}
                
                {call.status === 'pending' && (
                    <p className="mt-4 text-xs font-bold text-teal-600/60 uppercase tracking-widest text-center md:text-left">
                        {t.waitingMsg}
                    </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Doctors Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-200">
                <Video size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-black text-gray-800">{t.title}</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.subtitle}</p>
             </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={18} />
            <input 
                type="text"
                placeholder={language === 'hi' ? 'डॉक्टर खोजें...' : 'Search doctor...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none w-full md:w-80 font-medium transition-all"
            />
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">{t.noDoctors}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-teal-900/5 transition-all group border-b-4 border-b-transparent hover:border-b-teal-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800">Dr. {doc.name}</h3>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">{doc.specialization}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRequest(doc.id, 'audio')}
                    disabled={requesting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-teal-50 hover:text-teal-700 transition-all text-sm border border-gray-100"
                  >
                    <Phone size={16} />
                    <span>{t.requestAudio}</span>
                  </button>
                  <button 
                    onClick={() => handleRequest(doc.id, 'video')}
                    disabled={requesting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all text-sm shadow-lg shadow-teal-200 shadow-animate"
                  >
                    <Video size={16} />
                    <span>{t.requestVideo}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
