import React, { useState, useEffect, useContext } from 'react';
import { Video, Phone, PhoneOff, Mic, MicOff, User, Activity } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getAvailableDoctors, requestCall, cancelCall } from '../services/api';

export default function TalkToDoctor() {
  const { currentPatient } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Call States
  const [callStatus, setCallStatus] = useState('idle'); // idle | connecting | active
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [callType, setCallType] = useState(null); // video | voice
  const [currentCallId, setCurrentCallId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const patientId = currentPatient?.id || 'PT-8932'; // Fallback if no user exists

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
      const data = await getAvailableDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch available doctors', error);
      // Optional: Handle error states here
    } finally {
      setLoading(false);
    }
  };

  const initiateCall = async (doctor, type) => {
    setActiveDoctor(doctor);
    setCallType(type);
    setCallStatus('connecting');

    try {
      // Create request payload
      const payload = {
        patient_id: patientId,
        doctor_id: doctor.id || doctor._id,
        call_type: type,
      };

      const res = await requestCall(payload);
      setCurrentCallId(res.id || res._id); // store call ID from backend

      // Simulate the other party answering the call after 3 seconds
      setTimeout(() => {
        // In a real WebRTC app we would only set this active when accepted.
        // For hackathon prototype, auto-connect after 3 seconds:
        if (callStatus !== 'idle') { // check if not cancelled during those 3s
           setCallStatus('active');
        }
      }, 3000);

    } catch (error) {
      console.error('Call request failed', error);
      alert('Network Issue. Call failed.');
      endCallLocally();
    }
  };

  const cancelActiveCall = async () => {
    if (currentCallId) {
      try {
        await cancelCall(currentCallId);
      } catch (err) {
        console.error('Failed to cancel call securely', err);
      }
    }
    endCallLocally();
  };

  const endCallLocally = () => {
    setCallStatus('idle');
    setActiveDoctor(null);
    setCallType(null);
    setCurrentCallId(null);
    setCallDuration(0);
    setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------
  // RENDER: Connecting Screen
  // -------------------------
  if (callStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center">
        <div className="relative mb-8 mt-12">
          {/* Animated Pulsing Ring */}
          <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-30 scale-150"></div>
          {/* Circle Avatar */}
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center relative z-10 shadow-xl border-4 border-teal-100">
            <User size={48} className="text-teal-600" />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connecting...</h2>
        <p className="text-gray-500 font-medium mb-6">
          Aapka call <span className="text-teal-600 font-bold">{activeDoctor?.name}</span> ko bheja gaya hai...
        </p>
        
        <p className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
          {activeDoctor?.specialization}
        </p>

        <button 
          onClick={cancelActiveCall}
          className="mt-16 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <PhoneOff size={20} />
          Cancel
        </button>
      </div>
    );
  }

  // -------------------------
  // RENDER: Active Call Screen
  // -------------------------
  if (callStatus === 'active') {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 text-white relative">
        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
          
          {/* Top Left: Timer logic */}
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-gray-700">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-sm font-semibold tracking-widest">{formatTime(callDuration)}</span>
          </div>

          {/* Main Visual Node (Doctor avatar focus) */}
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-800 flex items-center justify-center mb-6 shadow-2xl border-4 border-gray-700 relative">
             <User size={64} className="text-gray-500" />
             {isMuted && (
                <div className="absolute -bottom-2 right-4 bg-red-500 rounded-full p-2 border-2 border-gray-800">
                  <MicOff size={16} className="text-white" />
                </div>
             )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1 tracking-wide">{activeDoctor?.name}</h2>
          <p className="text-gray-400 font-medium tracking-wider text-sm">{activeDoctor?.specialization}</p>

          {/* Picture in Picture (You) -> Only if Video Call */}
          {callType === 'video' && (
             <div className="absolute bottom-6 right-6 w-28 h-36 md:w-40 md:h-56 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-600 flex items-center justify-center">
               <User size={40} className="text-gray-600" />
               <div className="absolute bottom-2 left-2 text-xs font-semibold bg-black/60 px-2 py-1 rounded text-gray-200 backdrop-blur-sm">You</div>
             </div>
          )}
        </div>

        {/* Lower Call Handle Actions */}
        <div className="h-28 bg-gray-800/80 backdrop-blur-lg border-t border-gray-700/50 flex items-center justify-center gap-6 md:gap-10 px-4">
          <button 
            onClick={toggleMute}
            className={`p-4 md:p-5 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-gray-700 hover:bg-gray-600 border border-transparent text-white'}`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {callType === 'video' && (
            <button className="p-4 md:p-5 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all">
               <Video size={24} />
            </button>
          )}
          
          <button 
            onClick={() => {
              // Hackathon simple hang up
              endCallLocally();
            }}
            className="p-5 md:p-6 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/30 transform hover:scale-110 transition-all flex items-center justify-center"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------
  // RENDER: Default Directory View
  // -------------------------
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Available Doctors</h1>
        <p className="text-gray-500">Connect instantly via secure video or voice consultation.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
          <Activity className="animate-spin text-teal-500" size={36} />
          <p className="font-medium">Finding available doctors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <div key={doctor.id || doctor._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-100 transition-all group">
              <div className="flex items-start gap-4 mb-6 relative">
                <div className="relative">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl border border-teal-100 group-hover:bg-teal-100 transition-colors">
                    {doctor.name.charAt(4) || doctor.name.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{doctor.name}</h3>
                  <p className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded inline-block uppercase tracking-wider">
                    {doctor.specialization}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => initiateCall(doctor, 'video')}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-teal-700 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-sm"
                >
                  <Video size={16} />
                  Video Call
                </button>
                <button 
                  onClick={() => initiateCall(doctor, 'voice')}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-[var(--primary)] py-2.5 rounded-xl font-semibold transition-colors text-sm border border-teal-200"
                >
                  <Phone size={16} />
                  Voice Call
                </button>
              </div>
            </div>
          ))}
          
          {doctors.length === 0 && (
            <div className="col-span-full py-20 px-4 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">Doctors Offline</h3>
              <p className="text-gray-500 font-medium">Koi doctor abhi available nahi hai. Kripya baad mein try karein.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
