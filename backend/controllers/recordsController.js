const db = require('../db/database');

exports.getPatientRecords = (req, res) => {
  try {
    const { id: patient_id } = req.params;
    const { from, to, doctor_id } = req.query;

    let query = `
      SELECT r.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM health_records r
      JOIN doctors d ON r.doctor_id = d.id
      WHERE r.patient_id = ?
    `;
    const params = [patient_id];

    if (from) {
      query += ' AND r.created_at >= ?';
      params.push(`${from} 00:00:00`);
    }
    if (to) {
      query += ' AND r.created_at <= ?';
      params.push(`${to} 23:59:59`);
    }
    if (doctor_id) {
      query += ' AND r.doctor_id = ?';
      params.push(doctor_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const records = db.prepare(query).all(...params);

    // Fetch related prescriptions and lab reports for each record
    const enrichedRecords = records.map(record => {
      const prescription = db.prepare(`
        SELECT * FROM health_record_prescriptions 
        WHERE record_id = ?
      `).get(record.id);

      const labReports = db.prepare(`
        SELECT * FROM lab_reports 
        WHERE record_id = ?
      `).all(record.id);

      return {
        ...record,
        prescription: prescription ? {
          ...prescription,
          medicines: JSON.parse(prescription.medicines || '[]')
        } : null,
        lab_reports: labReports
      };
    });

    res.json(enrichedRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

exports.createRecord = (req, res) => {
  const transaction = db.transaction((data) => {
    const { 
      patient_id, doctor_id, session_id, diagnosis, 
      consultation_notes, medicines, instructions, follow_up 
    } = data;

    // 1. Create health record
    const recordResult = db.prepare(`
      INSERT INTO health_records (patient_id, doctor_id, session_id, diagnosis, consultation_notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(patient_id, doctor_id, session_id || null, diagnosis, consultation_notes);

    const recordId = recordResult.lastInsertRowid;

    // 2. Create prescription linked to the record
    db.prepare(`
      INSERT INTO health_record_prescriptions (record_id, medicines, instructions, follow_up)
      VALUES (?, ?, ?, ?)
    `).run(recordId, JSON.stringify(medicines || []), instructions, follow_up);

    return recordId;
  });

  try {
    const recordId = transaction(req.body);
    res.status(201).json({ message: 'Health record created', id: recordId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create health record' });
  }
};

exports.updateRecord = (req, res) => {
  const transaction = db.transaction((id, data) => {
    const { diagnosis, consultation_notes, medicines, instructions, follow_up } = data;

    // 1. Update health record
    db.prepare(`
      UPDATE health_records 
      SET diagnosis = ?, consultation_notes = ?
      WHERE id = ?
    `).run(diagnosis, consultation_notes, id);

    // 2. Update or Create prescription
    const existing = db.prepare('SELECT id FROM health_record_prescriptions WHERE record_id = ?').get(id);
    if (existing) {
      db.prepare(`
        UPDATE health_record_prescriptions 
        SET medicines = ?, instructions = ?, follow_up = ?
        WHERE record_id = ?
      `).run(JSON.stringify(medicines || []), instructions, follow_up, id);
    } else {
      db.prepare(`
        INSERT INTO health_record_prescriptions (record_id, medicines, instructions, follow_up)
        VALUES (?, ?, ?, ?)
      `).run(id, JSON.stringify(medicines || []), instructions, follow_up);
    }
  });

  try {
    const { id } = req.params;
    transaction(id, req.body);
    res.json({ message: 'Health record updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update health record' });
  }
};

exports.addLabReport = (req, res) => {
  try {
    const { id: record_id } = req.params;
    const { file_name, file_type, file_url } = req.body;

    db.prepare(`
      INSERT INTO lab_reports (record_id, file_name, file_type, file_url)
      VALUES (?, ?, ?, ?)
    `).run(record_id, file_name, file_type, file_url);

    res.status(201).json({ message: 'Lab report added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add lab report' });
  }
};
