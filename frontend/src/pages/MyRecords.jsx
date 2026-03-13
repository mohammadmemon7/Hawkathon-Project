import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { getPatientRecords } from '../services/api';
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
  RefreshCw,
  Clock,
  Clipboard,
  ShieldCheck,
  FlaskConical,
  WifiOff,
  Copy,
  ChevronRight
} from 'lucide-react';

const RECORDS_CACHE_PREFIX = 'records:';

export default function MyRecords() {
  const { currentPatient, language, lowBw } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);

  const t = {
    title: language === 'hi' ? 'चिकित्सा रिकॉर्ड' : 'Health Records',
    profileSummary: language === 'hi' ? 'रोगी सारांश' : 'Patient Summary',
    timeline: language === 'hi' ? 'समयरेखा' : 'Medical Timeline',
    noRecords: language === 'hi' ? 'कोई रिकॉर्ड नहीं मिला' : 'No clinical records found',
    age: language === 'hi' ? 'उम्र' : 'Age',
    village: language === 'hi' ? 'गांव' : 'Village',
    phone: language === 'hi' ? 'फोन' : 'Phone',
    diagnosis: language === 'hi' ? 'रोग की पहचान' : 'Diagnosis',
    notes: language === 'hi' ? 'डॉक्टर के नोट्स' : 'Clinical Notes',
    prescription: language === 'hi' ? 'दवा का पर्चा' : 'Prescription',
    followUp: language === 'hi' ? 'अगला परामर्श' : 'Follow up',
    labReports: language === 'hi' ? 'लैब रिपोर्ट' : 'Lab Reports',
    copyBtn: language === 'hi' ? 'सारांश कॉपी करें' : 'Copy Summary',
    offlineBanner: language === 'hi' ? 'ऑफलाइन - कैश्ड रिकॉर्ड' : 'Offline - showing cached records',
    lastVisited: language === 'hi' ? 'पिछला परामर्श' : 'Last Visited',
  };

  const loadData = async (silent = false) => {
    if (!currentPatient) return;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    const cacheKey = `${RECORDS_CACHE_PREFIX}${currentPatient.id}`;
    
    try {
      const data = await getPatientRecords(currentPatient.id);
      setRecords(data);
      localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setRecords(JSON.parse(cached).data);
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

  const handleCopySummary = (record) => {
    const medicines = record.prescription?.medicines?.join(', ') || 'None';
    const text = `
SEHATSETU MEDICAL SUMMARY
Date: ${new Date(record.created_at).toLocaleDateString()}
Doctor: ${record.doctor_name} (${record.doctor_specialization})

Diagnosis: ${record.diagnosis}
Notes: ${record.consultation_notes}

Prescription:
Medicines: ${medicines}
Instructions: ${record.prescription?.instructions || 'N/A'}
Follow up: ${record.prescription?.follow_up || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(record.id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`p-4 md:p-8 space-y-8 pb-24 ${lowBw ? 'no-animations' : ''}`}>
      {/* Offline Alert */}
      {error === 'offline' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
          <WifiOff size={20} className="text-amber-600" />
          <p className="text-sm font-bold">{t.offlineBanner}</p>
        </div>
      )}

      {/* Patient Profile Header */}
      <div className="bg-white rounded-[40px] p-6 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                <User size={40} />
            </div>
            <div className="flex-1 space-y-2">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{currentPatient?.name}</h2>
                <div className="flex flex-wrap gap-4 text-gray-400 text-sm font-bold">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Activity size={16} className="text-emerald-500" />
                        <span>{currentPatient?.age} {t.age}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <MapPin size={16} className="text-emerald-500" />
                        <span>{currentPatient?.village}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Phone size={16} className="text-emerald-500" />
                        <span>{currentPatient?.phone}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
            >
                <RefreshCw size={24} className={`text-emerald-600 ${isRefreshing ? 'animate-spin' : 'group-active:rotate-180 transition-transform'}`} />
            </button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
            <div className="w-1.5 h-8 bg-emerald-600 rounded-full"></div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-widest text-sm">{t.timeline}</h3>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100">
            <FileText size={64} className="mx-auto mb-6 text-gray-200" />
            <h3 className="text-xl font-black text-gray-800 mb-2">{t.noRecords}</h3>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
            {records.map((record, index) => (
              <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-600 text-white shadow-lg shadow-emerald-100 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                            <Calendar size={12} />
                            {new Date(record.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                        <h4 className="font-black text-gray-800">Dr. {record.doctor_name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{record.doctor_specialization}</p>
                    </div>
                    <button 
                        onClick={() => handleCopySummary(record)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            copySuccess === record.id ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                        {copySuccess === record.id ? <ShieldCheck size={14} /> : <Copy size={14} />}
                        {copySuccess === record.id ? 'Copied' : t.copyBtn}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t.diagnosis}</span>
                        <p className="text-lg font-black text-gray-800">{record.diagnosis}</p>
                    </div>

                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t.notes}</span>
                        <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-3xl border border-gray-50 italic">
                            "{record.consultation_notes}"
                        </p>
                    </div>

                    {record.prescription && (
                        <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-50">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.prescription}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {record.prescription.medicines.map((med, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">
                                        {med}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-emerald-800/80 mb-2"><strong>Instructions:</strong> {record.prescription.instructions}</p>
                            {record.prescription.follow_up && (
                                <p className="text-xs text-emerald-800/80"><strong>{t.followUp}:</strong> {record.prescription.follow_up}</p>
                            )}
                        </div>
                    )}

                    {record.lab_reports?.length > 0 && (
                        <div className="pt-4 border-t border-gray-50">
                             <div className="flex items-center gap-2 mb-3">
                                <FlaskConical size={16} className="text-purple-600" />
                                <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">{t.labReports}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {record.lab_reports.map((report) => (
                                    <a 
                                        key={report.id} 
                                        href={report.file_url || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-xl text-[10px] font-bold hover:bg-purple-100 transition-colors"
                                    >
                                        <FlaskConical size={12} />
                                        {report.file_name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
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
