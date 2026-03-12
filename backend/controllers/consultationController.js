const db = require('../db/database');
const aiService = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

exports.create = async (req, res, next) => {
  try {
    const { patient_id, symptoms, doctor_id } = req.body;

    const aiResult = await aiService.analyzeSymptoms(symptoms);

    const result = db.prepare(
      `INSERT INTO consultations (patient_id, symptoms, ai_triage_level, ai_explanation, ai_action, ai_remedies, ai_warning, doctor_id, priority_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      patient_id,
      symptoms,
      aiResult.triage_level,
      aiResult.simple_explanation,
      aiResult.immediate_action,
      aiResult.home_remedies ? JSON.stringify(aiResult.home_remedies) : null,
      aiResult.warning_signs,
      doctor_id || null,
      aiResult.priority_score || 0
    );

    const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(result.lastInsertRowid);

    if (doctor_id) {
      createNotification({
        userId: doctor_id,
        userType: 'doctor',
        title: 'New consultation assigned',
        message: `A new consultation from patient #${patient_id} is awaiting your review.`,
      });
    } else {
      const availableDoctors = db.prepare('SELECT id FROM doctors WHERE available = 1').all();
      for (const doctor of availableDoctors) {
        createNotification({
          userId: doctor.id,
          userType: 'doctor',
          title: 'New consultation queued',
          message: `A new consultation from patient #${patient_id} has been added to the pending queue.`,
        });
      }
    }

    res.status(201).json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const total = db.prepare(
      `SELECT COUNT(*) AS count FROM consultations c WHERE c.status != 'completed'`
    ).get().count;

    const consultations = db.prepare(
      `SELECT c.*, p.name AS patient_name, p.village AS patient_village
       FROM consultations c
       JOIN patients p ON c.patient_id = p.id
       WHERE c.status != 'completed'
       ORDER BY c.priority_score DESC, c.created_at ASC
       LIMIT ? OFFSET ?`
    ).all(limit, offset);

    res.json({ data: consultations, page, limit, total, totalPages: Math.ceil(total / limit) });
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

    createNotification({
      userId: consultation.patient_id,
      userType: 'patient',
      title: 'Consultation completed',
      message: `Your consultation #${consultation.id} has been completed by the doctor.`,
    });

    res.json(consultation);
  } catch (err) {
    next(err);
  }
};
