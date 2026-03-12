const db = require('../db/database');
const aiService = require('../services/aiService');

exports.create = async (req, res, next) => {
  try {
    const { patient_id, symptoms } = req.body;

    const aiResult = await aiService.analyzeSymptoms(symptoms);

    const result = db.prepare(
      `INSERT INTO consultations (patient_id, symptoms, ai_triage_level, ai_explanation, ai_action, ai_remedies, ai_warning, priority_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      patient_id,
      symptoms,
      aiResult.triage_level,
      aiResult.simple_explanation,
      aiResult.immediate_action,
      aiResult.home_remedies ? JSON.stringify(aiResult.home_remedies) : null,
      aiResult.warning_signs,
      aiResult.priority_score || 0
    );

    const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const consultations = db.prepare(
      `SELECT c.*, p.name AS patient_name, p.village AS patient_village
       FROM consultations c
       JOIN patients p ON c.patient_id = p.id
       WHERE c.status != 'completed'
       ORDER BY c.priority_score DESC, c.created_at ASC`
    ).all();
    res.json(consultations);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const consultation = db.prepare(
      `SELECT c.*, p.name AS patient_name, p.age AS patient_age, p.gender AS patient_gender,
              p.phone AS patient_phone, p.village AS patient_village, p.medical_history
       FROM consultations c
       JOIN patients p ON c.patient_id = p.id
       WHERE c.id = ?`
    ).get(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { doctor_notes, prescription } = req.body;
    db.prepare(
      'UPDATE consultations SET doctor_notes = ?, prescription = ? WHERE id = ?'
    ).run(doctor_notes, prescription, req.params.id);
    const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const { doctor_id } = req.body;
    db.prepare(
      "UPDATE consultations SET status = 'completed', doctor_id = ? WHERE id = ?"
    ).run(doctor_id, req.params.id);
    const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(req.params.id);
    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    next(err);
  }
};
