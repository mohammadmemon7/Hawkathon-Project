const db = require('../db/database');

exports.login = async (req, res, next) => {
  try {
    const { worker_id_code, password } = req.body;
    const worker = db.prepare('SELECT * FROM health_workers WHERE worker_id_code = ? AND password = ?').get(worker_id_code, password);
    
    if (!worker) return res.status(401).json({ error: 'Invalid worker credentials' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
};

exports.registerPatient = async (req, res, next) => {
    try {
        const { name, age, gender, phone, village } = req.body;
        const result = db.prepare(`
            INSERT INTO patients (name, age, gender, phone, village)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, age, gender, phone, village);
        
        const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
        res.json(newPatient);
    } catch (err) {
        next(err);
    }
};

exports.uploadVitals = async (req, res, next) => {
  try {
    const { patient_id, worker_id, temperature, bp_sys, bp_dia, pulse, spo2, notes } = req.body;
    
    const result = db.prepare(`
      INSERT INTO patient_vitals (patient_id, worker_id, temperature, bp_sys, bp_dia, pulse, spo2, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patient_id, worker_id, temperature, bp_sys, bp_dia, pulse, spo2, notes);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
};

exports.getPatientByPhone = async (req, res, next) => {
    try {
        const { phone } = req.query;
        const patient = db.prepare('SELECT * FROM patients WHERE phone = ?').get(phone);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        next(err);
    }
};

exports.getWorkerVitalsHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const history = db.prepare(`
            SELECT v.*, p.name as patient_name 
            FROM patient_vitals v
            JOIN patients p ON v.patient_id = p.id
            WHERE v.worker_id = ?
            ORDER BY v.created_at DESC
            LIMIT 50
        `).all(id);
        res.json(history);
    } catch (err) {
        next(err);
    }
};
