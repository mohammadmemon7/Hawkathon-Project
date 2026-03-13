import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getDoctorAppointments, updateConsultation } from '../services/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XSquare, 
  MessageSquare,
  Activity,
  Phone
} from 'lucide-react';

// Using separate function to explicitly update appointment status
import axios from 'axios';

export default function DoctorAppointments() {
  const { currentDoctor, language } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await getDoctorAppointments(currentDoctor.id);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDoctor.id]);

  const handleStatusUpdate = async (id, status) => {
    try {
      // Direct call to update status
      await axios.patch(`/api/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200">
           <Calendar size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-black text-gray-800">My Appointments</h1>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scheduled Consultations</p>
        </div>
      </div>

      <div className="grid gap-6">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-400">No appointments scheduled</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className={`bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all ${
              apt.status === 'completed' ? 'opacity-60' : 'opacity-100'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl">
                        {apt.patient_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-gray-800">{apt.patient_name}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                           <Phone size={14} />
                           {apt.patient_phone}
                        </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-700">{apt.appointment_date}</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-700">{apt.appointment_time}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        apt.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        apt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                        {apt.status}
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason for Consultation</span>
                    <p className="text-sm font-medium text-gray-600">{apt.reason || 'No reason provided'}</p>
                 </div>

                 {apt.status === 'scheduled' && (
                    <div className="flex items-end justify-end gap-3">
                       <button 
                        onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                        className="px-6 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all text-sm"
                       >
                         Cancel
                       </button>
                       <button 
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all text-sm shadow-lg shadow-purple-200"
                       >
                         Complete
                       </button>
                    </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
