import { useContext, useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Loader2, UserRound } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { createAppointment, getAvailableDoctors } from '../services/api';

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

function getMinimumDate() {
  return new Date().toISOString().split('T')[0];
}

export default function BookAppointment() {
  const { currentPatient } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: getMinimumDate(),
    appointment_time: '',
    notes: '',
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const doctorList = await getAvailableDoctors();
        setDoctors(doctorList);
      } catch (err) {
        setError(err.message || err.error || 'Doctors could not be loaded.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === form.doctor_id);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSlotSelect = (slot) => {
    setForm((current) => ({ ...current, appointment_time: slot }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!currentPatient?.id) {
      setError('Please register or select a patient profile before booking an appointment.');
      return;
    }

    if (!form.doctor_id || !form.appointment_date || !form.appointment_time) {
      setError('Doctor, date, and time slot are required.');
      return;
    }

    try {
      setSubmitting(true);
      const appointment = await createAppointment({
        patient_id: currentPatient.id,
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        notes: form.notes,
      });

      setMessage(`Appointment scheduled with ${appointment.doctor_name} on ${appointment.appointment_date} at ${appointment.appointment_time}.`);
      setForm((current) => ({ ...current, appointment_time: '', notes: '' }));
    } catch (err) {
      setError(err.message || err.error || 'Appointment could not be booked.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-500 p-6 text-white shadow-lg shadow-teal-900/10">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            <CalendarDays size={14} />
            Appointment Desk
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">Book a doctor appointment</h1>
          <p className="mt-2 max-w-2xl text-sm text-teal-50 md:text-base">
            Choose an available doctor, pick a date, reserve a time slot, and add context for the consultation.
          </p>
        </div>

        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <label htmlFor="doctor_id" className="mb-2 block text-sm font-semibold text-gray-700">
                Available doctor
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  id="doctor_id"
                  name="doctor_id"
                  value={form.doctor_id}
                  onChange={handleChange}
                  disabled={loadingDoctors}
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="appointment_date" className="mb-2 block text-sm font-semibold text-gray-700">
                Appointment date
              </label>
              <input
                id="appointment_date"
                type="date"
                name="appointment_date"
                min={getMinimumDate()}
                value={form.appointment_date}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock3 size={16} className="text-teal-600" />
                Time slots
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                      form.appointment_time === slot
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-900/10'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-gray-700">
                Notes for the doctor
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                value={form.notes}
                onChange={handleChange}
                placeholder="Mention symptoms, follow-up needs, or anything the doctor should review."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loadingDoctors}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CalendarDays size={18} />}
              {submitting ? 'Scheduling appointment...' : 'Confirm appointment'}
            </button>
          </form>

          <aside className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">Booking summary</h2>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Patient</p>
              <p className="mt-2 text-base font-semibold text-gray-800">{currentPatient?.name || 'No patient selected'}</p>
              <p className="mt-1 text-sm text-gray-500">{currentPatient?.phone || 'Register a patient to complete booking.'}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Doctor</p>
              <p className="mt-2 text-base font-semibold text-gray-800">{selectedDoctor?.name || 'Select an available doctor'}</p>
              <p className="mt-1 text-sm text-gray-500">{selectedDoctor?.specialization || 'Specialization will appear here.'}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-teal-50 p-4 text-teal-900">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Date</p>
                <p className="mt-2 text-lg font-bold">{form.appointment_date || 'Select a date'}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Time</p>
                <p className="mt-2 text-lg font-bold">{form.appointment_time || 'Pick a time slot'}</p>
              </div>
            </div>
            <p className="rounded-2xl bg-gray-900 px-4 py-3 text-sm text-gray-200">
              Appointments are created with status <span className="font-semibold text-white">scheduled</span>. Doctors can later complete or cancel them from backend workflows.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}