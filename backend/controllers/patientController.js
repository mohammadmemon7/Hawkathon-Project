const db = require('../db/database');

exports.register = async (req, res, next) => {
  try {
    const { name, age, gender, phone, village, medical_history } = req.body;

    const existing = db.prepare('SELECT * FROM patients WHERE phone = ?').get(phone);
    if (existing) return res.json(existing);

    const result = db.prepare(
      'INSERT INTO patients (name, age, gender, phone, village, medical_history) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, age, gender, phone, village, medical_history || '');

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
};

exports.getByPhone = async (req, res, next) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE phone = ?').get(req.params.phone);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const consultations = db.prepare(
      'SELECT * FROM consultations WHERE patient_id = ? ORDER BY created_at DESC'
    ).all(req.params.id);
    res.json(consultations);
  } catch (err) {
    next(err);
  }
};
