import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors, createAppointment } from '../services/api';
import { Calendar, Clock, User, Stethoscope, FileText, CheckCircle2, ChevronRight, Activity, CalendarDays } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '02:00 PM', '03:00 PM', '04:00 PM'
];

export default function BookAppointment() {
  const { currentPatient, language } = useContext(AppContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState('');

  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  const patientId = currentPatient?.id || 'PT-8932';

  // Get today's local date string formatted as YYYY-MM-DD for min date restricting
  const todayDate = new Date().toLocaleDateString('en-CA'); 

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDocs(true);
      const data = await getAvailableDoctors();
      setDoctors(data);
      // Auto-select first active doctor if list exists
      if (data && data.length > 0) {
        setForm(prev => ({ ...prev, doctor_id: data[0].id || data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
      setErrorToast('Could not load doctor list. Please try again.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = (timeStr) => {
    setForm(prev => ({ ...prev, appointment_time: timeStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorToast('');

    // Pre-validation block
    if (!form.doctor_id || !form.appointment_date || !form.appointment_time) {
      setErrorToast('Please select a Doctor, Date, and Time format.');
      return;
    }

    setSubmitting(true);

    try {
      await createAppointment({
        patient_id: patientId,
        doctor_id: form.doctor_id,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        reason: form.reason
      });

      setSuccess(true);
      
    } catch (err) {
      console.error('Failed booking appointment:', err);
      setErrorToast('Unable to secure booking. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    title: language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment',
    subtitle: language === 'hi' ? 'विशेषज्ञ डॉक्टरों से परामर्श का समय तय करें' : 'Schedule a consultation with our expert doctors',
    doctorLabel: language === 'hi' ? 'डॉक्टर चुनें' : 'Select Doctor',
    dateLabel: language === 'hi' ? 'तारीख' : 'Date',
    timeLabel: language === 'hi' ? 'समय' : 'Time',
    reasonLabel: language === 'hi' ? 'परामर्श का कारण' : 'Reason for Visit',
    submitText: language === 'hi' ? 'अपॉइंटमेंट पक्का करें' : 'Confirm Appointment',
    successTitle: language === 'hi' ? 'बुकिंग सफल' : 'Booking Successful!',
    successDesc: language === 'hi' ? 'आपका अपॉइंटमेंट तय हो गया है।' : 'Your appointment has been scheduled.',
    viewRecordsText: language === 'hi' ? 'मेरे रिकॉर्ड देखें' : 'View My Records',
  };

  // SUCCESS STATE OVERLAY
  if (success) {
    const selectedDoc = doctors.find(d => (d.id || d._id) === form.doctor_id);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white ring-4 ring-green-50">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">{t.successTitle}</h2>
        <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">{t.successDesc}</p>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left w-full max-w-sm mb-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-[0.03] rounded-bl-[100px] pointer-events-none"></div>
           
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Booking Snapshot</h3>
           
           <div className="space-y-3">
             <div className="flex items-center gap-3">
               <User size={18} className="text-teal-600" />
               <p className="text-gray-800 font-bold">{selectedDoc?.name}</p>
             </div>
             <div className="flex items-center gap-3">
               <Calendar size={18} className="text-teal-600" />
               <p className="text-gray-800 font-bold">{new Date(form.appointment_date).toLocaleDateString()}</p>
             </div>
             <div className="flex items-center gap-3">
               <Clock size={18} className="text-teal-600" />
               <p className="text-gray-800 font-bold">{form.appointment_time}</p>
             </div>
           </div>
        </div>

        <button 
          onClick={() => navigate('/records')}
          className="flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-bold shadow-md shadow-teal-900/20 transition-all hover:-translate-y-0.5"
        >
          {t.viewRecordsText} <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // MAIN SCHEDULING FORM
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto pb-24 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-2">{t.title}</h1>
        <p className="text-gray-500 font-medium">{t.subtitle}</p>
      </div>

      {errorToast && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-sm shadow-sm flex items-start gap-3">
           <Activity size={20} className="shrink-0 text-red-500 mt-0.5" />
           {errorToast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-bl-full pointer-events-none -z-0"></div>
        <div className="relative z-10 space-y-8">

          {/* Section: Doctor Selection */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
               <Stethoscope size={18} className="text-teal-600" />
               {t.doctorLabel}
            </label>
            
            {loadingDocs ? (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 font-medium flex items-center gap-3">
                <Activity className="animate-spin text-teal-500" size={18} />
                Loading professionals...
              </div>
            ) : (
              <div className="relative">
                <select 
                  name="doctor_id"
                  value={form.doctor_id}
                  onChange={handleInputChange}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
                  required
                >
                  <option value="" disabled>Select a practitioner</option>
                  {doctors.map(doc => (
                    <option key={doc.id || doc._id} value={doc.id || doc._id}>
                      {doc.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
                <ChevronRight size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section: Date Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                 <CalendarDays size={18} className="text-teal-600" />
                 {t.dateLabel}
              </label>
              <input 
                type="date"
                name="appointment_date"
                min={todayDate} // Disable past dates globally
                value={form.appointment_date}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-semibold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner uppercase tracking-wider"
                required
              />
            </div>
            
            {/* Sub-Section visual split */}
            <div className="hidden md:block w-px bg-gray-100 absolute left-1/2 top-48 bottom-12"></div>

            {/* Section: Time Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                 <Clock size={18} className="text-teal-600" />
                 {t.timeLabel}
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`py-3.5 px-2 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      form.appointment_time === time
                        ? 'bg-[var(--primary)] text-white shadow-md shadow-teal-900/20 ring-2 ring-teal-500 ring-offset-1'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Reason */}
          <div className="space-y-4">
             <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                 <FileText size={18} className="text-teal-600" />
                 {t.reasonLabel}
              </label>
              <textarea 
                name="reason"
                value={form.reason}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
                rows="3"
                placeholder="Share any symptom details, follow-up notes, or concerns..."
              ></textarea>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-[var(--primary)] hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-2xl py-4 font-bold text-lg shadow-md transition-colors"
            >
              {submitting ? (
                 <><Activity className="animate-spin" size={24} /> Processing Booking...</>
              ) : (
                 <><CheckCircle2 size={24} /> {t.submitText}</>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4 font-medium uppercase tracking-wider">Secure Scheduling Connection</p>
          </div>

        </div>
      </form>
    </div>
  );
}