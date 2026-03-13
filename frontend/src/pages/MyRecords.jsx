import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getPatientHistory } from '../services/api';
import { Filter, Download, User, Phone, MapPin, Activity, CalendarClock, Stethoscope, Droplets, FileText, CheckCircle2 } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';

function normalizeSymptoms(symptoms) {
  if (Array.isArray(symptoms)) return symptoms.filter(Boolean);
  if (!symptoms) return [];

  if (typeof symptoms === 'string') {
    try {
      const parsed = JSON.parse(symptoms);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Fall back to plain-text splitting
    }
    return symptoms.split(/,|\n/).map((item) => item.trim()).filter(Boolean);
  }

  return [String(symptoms)];
}

function normalizeRecord(record) {
  return {
    _id: record._id || record.id,
    date: record.date || record.created_at || new Date().toISOString(),
    symptoms: normalizeSymptoms(record.symptoms),
    triageLevel: record.triageLevel || record.ai_triage_level || 'Home Remedy',
    doctorNotes: record.doctorNotes || record.doctor_notes || '',
    prescription: record.prescription || '',
    status: record.status || 'completed', // Assume completed if historical
  };
}

export default function MyRecords() {
  const { currentPatient, language } = useContext(AppContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triageFilter, setTriageFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Fallbacks
  const patientId = currentPatient?.id || 'PT-8932';
  const patientName = currentPatient?.name || 'Ramesh Kumar';
  const patientAge = currentPatient?.age || 45;
  const patientVillage = currentPatient?.village || 'Nabha';
  const patientPhone = currentPatient?.phone || '+91 987654321';
  const patientGender = currentPatient?.gender || 'Purush';
  const patientMedicalHistory = currentPatient?.medical_history || 'None provided';

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getPatientHistory(patientId).catch(() => ([])); // Use empty array to simulate missing records if API fails or backend holds no records
      
      // Temporary stub block if explicitly required for preview:
      // const data = [
      //   {
      //     _id: 'C-001',
      //     date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      //     symptoms: ['Slight fever', 'Cough'],
      //     triageLevel: 'Home Remedy',
      //     doctorNotes: 'Take rest and drink warm water. No heavy medication needed.',
      //     prescription: 'Paracetamol 500mg (SOS)',
      //     status: 'completed'
      //   },
      //   {
      //     _id: 'C-002',
      //     date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      //     symptoms: ['Severe chest pain', 'Shortness of breath'],
      //     triageLevel: 'Emergency',
      //     doctorNotes: 'Referred to district hospital immediately.',
      //     prescription: '',
      //     status: 'pending'
      //   }
      // ];
      
      setHistory((data || []).map(normalizeRecord));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (level) => {
    const l = level.toUpperCase();
    if(l === 'EMERGENCY') return 'bg-red-100 text-red-700 border-red-200 shadow-sm shadow-red-100';
    if(l === 'CONSULT_SOON' || l === 'CONSULT SOON') return 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-100';
    return 'bg-green-100 text-green-700 border-green-200 shadow-sm shadow-green-100';
  };

  const copyReportToClipboard = async (record) => {
    const text = `SehatSetu AI - Consultation Report
--------------------------------------
Patient: ${patientName} (ID: ${patientId}, Age: ${patientAge}, Gender: ${patientGender})
Date: ${new Date(record.date).toLocaleString()}

Triage Level: ${record.triageLevel.toUpperCase()}
Symptoms: ${record.symptoms.join(', ')}

Doctor Notes: 
${record.doctorNotes || 'None provided.'}

Prescription: 
${record.prescription || 'None provided.'}

Status: ${record.status.toUpperCase()}
--------------------------------------
Disclaimer: This is a system generated report.`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(record._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const filteredHistory = history.filter(h => {
    if (triageFilter === 'All') return true;
    return h.triageLevel.toUpperCase() === triageFilter.toUpperCase();
  });

  const t = {
    myRecords: language === 'hi' ? 'मेरे रिकॉर्ड' : 'My Records',
    patientProfile: language === 'hi' ? 'रोगी प्रोफ़ाइल' : 'Patient Profile',
    age: language === 'hi' ? 'उम्र' : 'Age',
    gender: language === 'hi' ? 'लिंग' : 'Gender',
    village: language === 'hi' ? 'गाँव' : 'Village',
    phone: language === 'hi' ? 'फ़ोन' : 'Phone',
    medHistory: language === 'hi' ? 'मेडिकल हिस्ट्री' : 'Medical History',
    summary: language === 'hi' ? 'सारांश' : 'Summary',
    totalConsultations: language === 'hi' ? 'कुल परामर्श' : 'Total Consultations',
    lastVisit: language === 'hi' ? 'अंतिम विजिट' : 'Last Visit',
    filterBy: language === 'hi' ? 'फ़िल्टर करें' : 'Filter by',
    all: language === 'hi' ? 'सभी' : 'All',
    emergency: language === 'hi' ? 'आपातकालीन' : 'Emergency',
    consultSoon: language === 'hi' ? 'जल्द परामर्श लें' : 'Consult Soon',
    homeRemedy: language === 'hi' ? 'घरेलू उपचार' : 'Home Remedy',
    symptoms: language === 'hi' ? 'लक्षण:' : 'Symptoms:',
    notes: language === 'hi' ? 'डॉक्टर के नोट्स:' : 'Doctor Notes:',
    prescription: language === 'hi' ? 'पर्चा:' : 'Prescription:',
    downloadReport: language === 'hi' ? 'कॉपी करें' : 'Copy Text',
    copiedReport: language === 'hi' ? 'कॉपी हो गया' : 'Copied!',
    statusPrefix: language === 'hi' ? 'स्थिति:' : 'Status:',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{t.myRecords}</h1>
      </div>

      {/* Patient Profile Card (Updated) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-[0.03] rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform origin-top-right"></div>
        
        <div className="flex items-center gap-6 flex-1">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-teal-500 to-[var(--primary)] rounded-full text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white ring-4 ring-teal-50 shadow-teal-900/10">
            {patientName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">{patientName}</h2>
            <p className="text-gray-400 font-bold tracking-wide text-xs mt-1 uppercase">ID: {patientId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 w-full md:w-auto md:min-w-[250px] bg-gray-50/80 p-5 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
             <User size={16} className="text-[var(--primary)]" />
             <span>{t.age}: <span className="text-gray-900 font-bold">{patientAge} yrs</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
             <User size={16} className="text-[var(--primary)]" />
             <span>{t.gender}: <span className="text-gray-900 font-bold">{patientGender}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
             <MapPin size={16} className="text-[var(--primary)]" />
             <span>{t.village}: <span className="text-gray-900 font-bold">{patientVillage}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
             <Phone size={16} className="text-[var(--primary)]" />
             <span>{t.phone}: <span className="text-gray-900 font-bold">{patientPhone}</span></span>
          </div>
        </div>
      </div>
      
      {/* Medical History Snippet appended below Profile Overview */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/60 shadow-sm flex items-start gap-3">
         <Activity className="text-amber-500 mt-0.5 shrink-0" size={18} />
         <p className="text-sm font-medium text-amber-900"><span className="font-bold">{t.medHistory}:</span> {patientMedicalHistory}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
           <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[var(--primary)] shadow-inner">
             <Stethoscope size={24} />
           </div>
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t.totalConsultations}</p>
             <p className="text-2xl font-black text-gray-800">{history.length}</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
           <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
             <CalendarClock size={24} />
           </div>
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t.lastVisit}</p>
             <p className="text-lg font-bold text-gray-800 leading-tight">
               {history.length > 0 ? formatTimeAgo(history[0].date) : '-'}
             </p>
           </div>
        </div>
      </div>

      {/* Triage Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
          <Filter size={20} className="text-[var(--primary)]" />
          <span>{t.filterBy}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Emergency', 'Consult Soon', 'Home Remedy'].map((level) => (
            <button 
              key={level}
              onClick={() => setTriageFilter(level)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                triageFilter === level 
                  ? 'bg-[var(--primary)] text-white shadow-md shadow-teal-900/10' 
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {level === 'All' ? t.all : 
               level === 'Emergency' ? t.emergency : 
               level === 'Consult Soon' ? t.consultSoon : t.homeRemedy}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Activity className="animate-spin text-teal-600" size={32} />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-14 px-6 text-gray-500 font-medium bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <FileText size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-lg font-bold text-gray-600">Aapka koi purana record nahi hai.</p>
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div key={record._id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
               {/* Left accent color strip based on triage */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${record.triageLevel.toUpperCase() === 'EMERGENCY' ? 'bg-red-500' : (record.triageLevel.toUpperCase() === 'CONSULT SOON' || record.triageLevel.toUpperCase() === 'CONSULT_SOON') ? 'bg-amber-500' : 'bg-green-500'}`}></div>

               <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                 <div className="flex items-center gap-3 flex-wrap">
                   <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2 shadow-sm">
                     <CalendarClock size={16} className="text-gray-600" />
                     <span className="font-bold text-gray-800 text-sm">{formatTimeAgo(record.date)}</span>
                   </div>
                   
                   {/* Triage Badge */}
                   <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${getTriageColor(record.triageLevel)}`}>
                     {record.triageLevel.toUpperCase() === 'EMERGENCY' ? t.emergency : (record.triageLevel.toUpperCase() === 'CONSULT_SOON' || record.triageLevel.toUpperCase() === 'CONSULT SOON') ? t.consultSoon : t.homeRemedy}
                   </span>
                   
                   {/* Status Badge */}
                   <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${record.status === 'pending' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                     {record.status === 'pending' ? 'Pending' : 'Completed'}
                   </span>

                 </div>
                 
                 <button 
                   onClick={() => copyReportToClipboard(record)}
                   className="hidden md:flex items-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-teal-500/50"
                 >
                   {copiedId === record._id ? (
                     <><CheckCircle2 size={18} className="text-green-600" /> <span className="text-green-700">{t.copiedReport}</span></>
                   ) : (
                     <><Download size={18} /> {t.downloadReport}</>
                   )}
                 </button>
               </div>

               <div className="space-y-4">
                 <div>
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                     <Activity size={16} /> {t.symptoms}
                   </h4>
                   <div className="flex flex-wrap gap-2">
                     {record.symptoms.map((sym, i) => (
                       <span key={i} className="bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                         {sym}
                       </span>
                     ))}
                   </div>
                 </div>

                 {record.doctorNotes && (
                   <div className="bg-amber-50/50 p-4 md:p-5 rounded-xl border border-amber-100">
                     <h4 className="text-sm font-bold text-amber-800 mb-1.5 flex items-center gap-2">
                       <FileText size={18} /> {t.notes}
                     </h4>
                     <p className="text-amber-900/80 text-sm font-medium leading-relaxed">{record.doctorNotes}</p>
                   </div>
                 )}

                 {record.prescription && (
                   <div className="bg-blue-50/50 p-4 md:p-5 rounded-xl border border-blue-100">
                     <h4 className="text-sm font-bold text-blue-800 mb-1.5 flex items-center gap-2">
                       <Droplets size={18} /> {t.prescription}
                     </h4>
                     <p className="text-blue-900/80 text-sm font-medium leading-relaxed">{record.prescription}</p>
                   </div>
                 )}
               </div>

               <button 
                 onClick={() => copyReportToClipboard(record)}
                 className="mt-6 w-full md:hidden flex items-center justify-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-3 rounded-xl transition-colors shadow-sm"
               >
                 {copiedId === record._id ? (
                   <><CheckCircle2 size={18} className="text-green-600" /> <span className="text-green-700">{t.copiedReport}</span></>
                 ) : (
                   <><Download size={18} /> {t.downloadReport}</>
                 )}
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
