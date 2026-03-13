const db = require('../db/database');

exports.create = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    const result = db.prepare(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)'
    ).run(patient_id, doctor_id, appointment_date, appointment_time, reason || '');
    
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization 
      FROM appointments a 
      JOIN doctors d ON a.doctor_id = d.id 
      WHERE a.patient_id = ? 
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `).all(req.params.id);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      WHERE a.doctor_id = ? 
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `).all(req.params.id);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    db.prepare('UPDATE appointments SET status = ?, notes = ? WHERE id = ?')
      .run(status, notes || '', req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    db.prepare('UPDATE appointments SET status = "cancelled" WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};