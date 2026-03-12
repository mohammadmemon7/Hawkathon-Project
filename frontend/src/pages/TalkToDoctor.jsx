import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Video, Phone, PhoneOff, Mic, MicOff, User, Activity } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function TalkToDoctor() {
  const { currentPatient, language } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Call States
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [callType, setCallType] = useState(null); // video | voice
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Fallback patient ID
  const patientId = currentPatient?.id || 'PT-8932';

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let timer;
    if (callStatus === 'active') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Wait for backend or use dummy data if backend is offline
      const response = await axios.get('http://localhost:5000/api/doctors/available').catch(() => ({
        data: [
          { _id: 'DOC-001', name: 'Dr. Sharma', specialization: 'General Physician' },
          { _id: 'DOC-002', name: 'Dr. Gupta', specialization: 'Cardiologist' },
          { _id: 'DOC-003', name: 'Dr. Verma', specialization: 'Pediatrician' },
        ]
      }));
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async (doctor, type) => {
    setActiveDoctor(doctor);
    setCallType(type);
    setCallStatus('connecting');

    try {
      await axios.post('http://localhost:5000/api/calls/request', {
        patient_id: patientId,
        doctor_id: doctor._id,
        call_type: type,
      }).catch(err => console.warn('Backend call route might not be ready, proceeding with simulation', err));
      
      // Simulate connection delay
      setTimeout(() => {
        setCallStatus('active');
      }, 3000);

    } catch (error) {
      console.error('Call failed', error);
      setCallStatus('idle');
      setActiveDoctor(null);
    }
  };

  const endCall = () => {
    setCallStatus('idle');
    setActiveDoctor(null);
    setCallType(null);
    setCallDuration(0);
    setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (callStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center relative z-10 shadow-xl border-4 border-white">
            <User size={40} className="text-teal-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting...</h2>
        <p className="text-gray-500 font-medium">To {activeDoctor?.name}</p>
        <button 
          onClick={endCall}
          className="mt-12 bg-red-100 text-red-600 hover:bg-red-200 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
        >
          <PhoneOff size={20} />
          Cancel
        </button>
      </div>
    );
  }

  if (callStatus === 'active') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 text-white">
        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-lg font-medium">{formatTime(callDuration)}</span>
          </div>

          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-800 flex items-center justify-center mb-6 shadow-2xl border-4 border-gray-700">
             <User size={64} className="text-gray-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{activeDoctor?.name}</h2>
          <p className="text-gray-400">{activeDoctor?.specialization}</p>

          {callType === 'video' && (
             <div className="absolute bottom-6 right-6 w-24 h-32 md:w-32 md:h-44 bg-gray-800 rounded-xl overflow-hidden shadow-xl border-2 border-gray-700 flex items-center justify-center">
               <User size={32} className="text-gray-600" />
               <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-1 rounded">You</div>
             </div>
          )}
        </div>

        <div className="h-24 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-6 px-4">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={endCall}
            className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/20 transform hover:scale-105 transition-all"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Available Doctors</h1>
        <p className="text-gray-500">Connect instantly via secure video or voice consultation.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <Activity className="animate-spin text-teal-500" size={32} />
          <p>Finding available doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl border-2 border-teal-100">
                  {doctor.name.charAt(4) || doctor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
                  <p className="text-sm font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded inline-block mt-1">
                    {doctor.specialization}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => initiateCall(doctor, 'video')}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Video size={18} />
                  Video Call
                </button>
                <button 
                  onClick={() => initiateCall(doctor, 'voice')}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 py-2.5 rounded-xl font-semibold transition-colors text-sm border border-teal-200/50"
                >
                  <Phone size={18} />
                  Voice Call
                </button>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No doctors available right now. Please try again later.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
