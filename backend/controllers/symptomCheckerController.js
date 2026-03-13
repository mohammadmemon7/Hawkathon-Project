const db = require('../db/database');
const { analyzeSymptomsLite } = require('../services/symptomEngine');

exports.analyze = (req, res, next) => {
  try {
    const { patient_id, symptoms, language = 'hi' } = req.body;

    if (!patient_id || !symptoms) {
      return res.status(400).json({ error: 'Patient ID and symptoms are required' });
    }

    const analysis = analyzeSymptomsLite(symptoms, language);

    const result = db.prepare(`
      INSERT INTO symptom_checks (patient_id, symptoms, possible_condition, risk_level, recommendation, explanation, matched_symptoms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      patient_id,
      symptoms,
      analysis.condition,
      analysis.risk_level,
      analysis.recommendation,
      analysis.explanation,
      JSON.stringify(analysis.matched_symptoms || [])
    );

    const savedRecord = db.prepare('SELECT * FROM symptom_checks WHERE id = ?').get(result.lastInsertRowid);
    
    // Parse JSON for response
    if (savedRecord.matched_symptoms) {
        savedRecord.matched_symptoms = JSON.parse(savedRecord.matched_symptoms);
    }

    res.status(201).json(savedRecord);
  } catch (err) {
    next(err);
  }
};
