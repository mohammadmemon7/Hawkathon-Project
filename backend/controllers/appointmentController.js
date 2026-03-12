const db = require('../db/database');
const { createNotification } = require('../services/notificationService');

exports.create = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'patient_id, doctor_id, appointment_date and appointment_time are required' });
    }

    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const result = db.prepare(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes)
       VALUES (?, ?, ?, ?, 'scheduled', ?)`
    ).run(patient_id, doctor_id, appointment_date, appointment_time, notes || '');

    const appointment = db.prepare(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization AS doctor_specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`
    ).get(result.lastInsertRowid);

    createNotification({
      userId: patient_id,
      userType: 'patient',
      title: 'Appointment scheduled',
      message: `Your appointment with ${appointment.doctor_name} is scheduled for ${appointment.appointment_date} at ${appointment.appointment_time}.`,
    });

    createNotification({
      userId: doctor_id,
      userType: 'doctor',
      title: 'New appointment booked',
      message: `${appointment.patient_name} booked an appointment for ${appointment.appointment_date} at ${appointment.appointment_time}.`,
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.getByPatient = async (req, res, next) => {
  try {
    const appointments = db.prepare(
      `SELECT a.*, d.name AS doctor_name, d.specialization AS doctor_specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date ASC, a.appointment_time ASC, a.created_at DESC`
    ).all(req.params.id);

    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.getByDoctor = async (req, res, next) => {
  try {
    const appointments = db.prepare(
      `SELECT a.*, p.name AS patient_name, p.phone AS patient_phone, p.village AS patient_village
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date ASC, a.appointment_time ASC, a.created_at DESC`
    ).all(req.params.id);

    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);

    const updatedAppointment = db.prepare(
      `SELECT a.*, p.name AS patient_name, d.name AS doctor_name, d.specialization AS doctor_specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`
    ).get(req.params.id);

    res.json(updatedAppointment);
  } catch (err) {
    next(err);
  }
};