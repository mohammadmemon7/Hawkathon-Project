import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getPatientHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Activity, 
  AlertCircle,
  Stethoscope,
  Filter,
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';

const RECORDS_CACHE_KEY = 'sehatsetu_records_cache';

export default function MyRecords() {
  const { currentPatient, language } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = {
    title: language === 'hi' ? 'मेरे चिकित्सा रिकॉर्ड' : 'My Medical Records',
    profileSummary: language === 'hi' ? 'प्रोफ़ाइल सारांश' : 'Profile Summary',
    historyTitle: language === 'hi' ? 'परामर्श इतिहास' : 'Consultation History',
    noRecords: language === 'hi' ? 'कोई रिकॉर्ड नहीं मिला' : 'No records found',
    age: language === 'hi' ? 'उम्र' : 'Age',
    gender: language === 'hi' ? 'लिंग' : 'Gender',
    village: language === 'hi' ? 'गांव' : 'Village',
    medicalHistory: language === 'hi' ? 'पुरानी बीमारियां' : 'Medical History',
    doctorNotes: language === 'hi' ? 'डॉक्टर के नोट्स' : 'Doctor Notes',
    prescription: language === 'hi' ? 'दवा का पर्चा' : 'Prescription',
    status: language === 'hi' ? 'स्थिति' : 'Status',
    date: language === 'hi' ? 'तारीख' : 'Date',
    symptoms: language === 'hi' ? 'लक्षण' : 'Symptoms',
    offlineMode: language === 'hi' ? 'आप ऑफलाइन रिकॉर्ड देख रहे हैं' : 'Viewing offline records',
    filters: {
      All: language === 'hi' ? 'सभी' : 'All',
      Emergency: language === 'hi' ? 'आपातकालीन' : 'Emergency',
      'Consult Soon': language === 'hi' ? 'जल्द परामर्श' : 'Consult Soon',
      'Home Remedy': language === 'hi' ? 'घरेलू उपचार' : 'Home Remedy'
    }
  };

  const loadData = async (silent = false) => {
    if (!currentPatient) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await getPatientHistory(currentPatient.id);
      setRecords(data);
      window.localStorage.setItem(`${RECORDS_CACHE_KEY}_${currentPatient.id}`, JSON.stringify(data));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      // Attempt to load from cache
      const cached = window.localStorage.getItem(`${RECORDS_CACHE_KEY}_${currentPatient.id}`);
      if (cached) {
        setRecords(JSON.parse(cached));
        setError('offline');
      } else {
        setError('failed');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPatient?.id]);

  const filteredRecords = useMemo(() => {
    if (filter === 'All') return records;
    
    const filterMap = {
      'Emergency': 3,
      'Consult Soon': 2,
      'Home Remedy': 1
    };
    
    return records.filter(r => r.priority_score === filterMap[filter]);
  }, [records, filter]);

  const getTriageBadge = (score) => {
    switch (score) {
      case 3:
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200 uppercase tracking-wider">{t.filters.Emergency}</span>;
      case 2:
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200 uppercase tracking-wider">{t.filters['Consult Soon']}</span>;
      case 1:
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-wider">{t.filters['Home Remedy']}</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200 uppercase tracking-wider">Normal</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      {/* Offline Alert */}
      {error === 'offline' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
          <AlertCircle size={20} className="text-amber-600" />
          <p className="text-sm font-bold">{t.offlineMode}</p>
        </div>
      )}

      {/* Patient Profile Summary Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
              {currentPatient?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentPatient?.name}</h2>
              <div className="flex items-center gap-2 text-teal-50 text-sm font-medium opacity-90 mt-1">
                <p>PID: {currentPatient?.id}</p>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Phone size={14} />
                  {currentPatient?.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
              <User size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">{t.age} & {t.gender}</span>
            </div>
            <p className="text-gray-800 font-bold">{currentPatient?.age} yr, {currentPatient?.gender}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">{t.village}</span>
            </div>
            <p className="text-gray-800 font-bold">{currentPatient?.village}</p>
          </div>

          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">{t.medicalHistory}</span>
            </div>
            <p className="text-gray-800 font-medium italic">
              {currentPatient?.medical_history || (language === 'hi' ? 'कोई पिछला रिकॉर्ड नहीं' : 'No previous history recorded')}
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{t.historyTitle}</h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {Object.keys(t.filters).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  filter === f 
                  ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-teal-200'
                }`}
              >
                {t.filters[f]}
              </button>
            ))}
            <button 
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className={`p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-teal-600 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* List of Consultations */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{t.noRecords}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="flex flex-col lg:flex-row lg:items-center">
                  {/* Left Column: Triage & Date */}
                  <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-50 bg-gray-50/30 lg:w-72 flex-shrink-0">
                    <div className="mb-4">{getTriageBadge(record.priority_score)}</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.date}</span>
                      </div>
                      <p className="font-bold text-gray-800">
                        {new Date(record.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-teal-600/60 font-medium text-xs">
                        <Clock size={12} />
                        <span>{new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="p-6 lg:p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-600/70 font-black text-[10px] uppercase tracking-widest">
                          <Stethoscope size={12} />
                          {t.symptoms}
                        </div>
                        <p className="text-gray-800 font-bold leading-relaxed">{record.symptoms}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                          <Clock size={12} />
                          {t.status}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className={`w-2 h-2 rounded-full ${record.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                           <span className="text-sm font-bold text-gray-700 capitalize">{record.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                      <div className="space-y-1">
                        <span className="text-teal-600/70 font-black text-[10px] uppercase tracking-widest block">{t.doctorNotes}</span>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                          {record.doctor_notes || (language === 'hi' ? 'परामर्श लंबित है' : 'Consultation pending...')}
                        </p>
                      </div>
                      
                      {record.prescription && (
                        <div className="space-y-1 pt-2 border-t border-gray-100">
                          <span className="text-teal-600/70 font-black text-[10px] uppercase tracking-widest block">{t.prescription}</span>
                          <p className="text-sm font-bold text-gray-800">{record.prescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
