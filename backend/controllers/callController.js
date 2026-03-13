const db = require('../db/database');

exports.requestCall = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, mode, notes } = req.body;
    const result = db.prepare(
      'INSERT INTO call_requests (patient_id, doctor_id, mode, notes) VALUES (?, ?, ?, ?)'
    ).run(patient_id, doctor_id, mode, notes || '');
    
    res.status(201).json({ id: result.lastInsertRowid, status: 'pending' });
  } catch (err) {
    next(err);
  }
};

exports.getPatientCalls = async (req, res, next) => {
  try {
    const calls = db.prepare(`
      SELECT c.*, d.name as doctor_name 
      FROM call_requests c 
      JOIN doctors d ON c.doctor_id = d.id 
      WHERE c.patient_id = ? 
      ORDER BY c.created_at DESC
    `).all(req.params.id);
    res.json(calls);
  } catch (err) {
    next(err);
  }
};

exports.getPendingCalls = async (req, res, next) => {
  try {
    const calls = db.prepare(`
      SELECT c.*, p.name as patient_name 
      FROM call_requests c 
      JOIN patients p ON c.patient_id = p.id 
      WHERE c.status = 'pending' 
      ORDER BY c.created_at ASC
    `).all();
    res.json(calls);
  } catch (err) {
    next(err);
  }
};

exports.acceptCall = async (req, res, next) => {
  try {
    const meeting_code = 'SS-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    db.prepare('UPDATE call_requests SET status = "accepted", meeting_code = ? WHERE id = ?')
      .run(meeting_code, req.params.id);
    res.json({ meeting_code });
  } catch (err) {
    next(err);
  }
};

exports.completeCall = async (req, res, next) => {
  try {
    db.prepare('UPDATE call_requests SET status = "completed" WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
