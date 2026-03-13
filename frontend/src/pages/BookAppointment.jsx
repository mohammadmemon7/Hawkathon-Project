import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors, createAppointment } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  ChevronRight,
  ArrowLeft,
  CalendarDays
} from 'lucide-react';

export default function BookAppointment() {
  const { currentPatient, language } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const t = {
    title: language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment',
    selectDoctor: language === 'hi' ? 'डॉक्टर चुनें' : 'Select Doctor',
    selectDateTime: language === 'hi' ? 'तारीख और समय चुनें' : 'Select Date & Time',
    reason: language === 'hi' ? 'परामर्श का कारण' : 'Reason for Consultation',
    bookNow: language === 'hi' ? 'अभी बुक करें' : 'Book Now',
    success: language === 'hi' ? 'अपॉइंटमेंट सफलतापूर्वक बुक हो गया है!' : 'Appointment booked successfully!',
    back: language === 'hi' ? 'पीछे' : 'Back',
    next: language === 'hi' ? 'अगला' : 'Next',
  };

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const data = await getAvailableDoctors();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const handleBook = async () => {
    setSubmitting(true);
    try {
      await createAppointment({
        patient_id: currentPatient.id,
        doctor_id: selectedDoctor.id,
        appointment_date: formData.date,
        appointment_time: formData.time,
        reason: formData.reason
      });
      setStep(3); // Success step
    } catch (err) {
      alert(language === 'hi' ? 'बुकिंग विफल रही' : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <div className="flex items-center gap-4">
        {step > 1 && step < 3 && (
          <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-black text-gray-800">{t.title}</h1>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">{t.selectDoctor}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <button 
                key={doc.id}
                onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black group-hover:bg-teal-600 group-hover:text-white transition-all">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800">Dr. {doc.name}</h3>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">{doc.specialization}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl border border-teal-100">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em]">Booking with</p>
              <h3 className="font-black text-gray-800">Dr. {selectedDoctor.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} />
                {language === 'hi' ? 'तारीख' : 'Date'}
              </label>
              <input 
                type="date" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none font-bold text-gray-700"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />
                {language === 'hi' ? 'समय' : 'Time'}
              </label>
              <input 
                type="time" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none font-bold text-gray-700"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} />
              {t.reason}
            </label>
            <textarea 
              rows="3"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 outline-none font-medium text-gray-700"
              placeholder={language === 'hi' ? 'अपनी समस्या लिखें...' : 'Describe your health issue...'}
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <button 
            onClick={handleBook}
            disabled={!formData.date || !formData.time || submitting}
            className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-500/20 hover:bg-teal-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {submitting ? 'Booking...' : t.bookNow}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md mx-auto py-16 text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
            <CheckCircle size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">{t.success}</h2>
            <p className="text-gray-500 font-medium">
              {language === 'hi' 
              ? `आपका अपॉइंटमेंट Dr. ${selectedDoctor.name} के साथ ${formData.date} को ${formData.time} बजे बुक हो गया है।` 
              : `Your appointment with Dr. ${selectedDoctor.name} is confirmed for ${formData.date} at ${formData.time}.`}
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
}