const db = require('../db/database');

exports.create = (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Missing required appointment fields' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
      VALUES (?, ?, ?, ?, ?, 'scheduled')
    `);
    
    const info = stmt.run(patient_id, doctor_id, appointment_date, appointment_time, reason || null);

    res.status(201).json({
      id: info.lastInsertRowid,
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      status: 'scheduled'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

exports.getByPatient = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    
    const appointments = stmt.all(req.params.id);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

exports.getByDoctor = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT a.*, p.name as patient_name, p.gender, p.age, p.phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `);
    
    const appointments = stmt.all(req.params.id);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

exports.cancel = (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE appointments 
      SET status = 'cancelled' 
      WHERE id = ?
    `);
    
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment cancelled successfully', id: req.params.id });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};