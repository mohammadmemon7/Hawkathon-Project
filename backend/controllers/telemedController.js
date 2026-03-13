const db = require('../db/database');

exports.createSession = (req, res) => {
  try {
    const { patient_id, doctor_id, mode } = req.body;
    if (!patient_id || !doctor_id || !mode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const info = db.prepare(`
      INSERT INTO consultation_sessions (patient_id, doctor_id, mode, status)
      VALUES (?, ?, ?, 'requested')
    `).run(patient_id, doctor_id, mode);

    const session = db.prepare('SELECT * FROM consultation_sessions WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

exports.getPatientSessions = (req, res) => {
  try {
    const { id } = req.params;
    const sessions = db.prepare(`
      SELECT s.*, d.name as doctor_name, d.specialization as doctor_specialization
      FROM consultation_sessions s
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `).all(id);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch patient sessions' });
  }
};

exports.getDoctorSessions = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    let query = `
      SELECT s.*, p.name as patient_name
      FROM consultation_sessions s
      JOIN patients p ON s.patient_id = p.id
      WHERE s.doctor_id = ?
    `;
    const params = [id];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC';

    const sessions = db.prepare(query).all(...params);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctor sessions' });
  }
};

exports.acceptSession = (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id } = req.body;
    
    const meeting_code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const result = db.prepare(`
      UPDATE consultation_sessions 
      SET status = 'accepted', started_at = CURRENT_TIMESTAMP, meeting_code = ?
      WHERE id = ? AND doctor_id = ?
    `).run(meeting_code, id, doctor_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    const updated = db.prepare('SELECT * FROM consultation_sessions WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to accept session' });
  }
};

exports.completeSession = (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, diagnosis, consultation_notes } = req.body;

    // 1. Mark session as completed
    const result = db.prepare(`
      UPDATE consultation_sessions 
      SET status = 'completed', ended_at = CURRENT_TIMESTAMP
      WHERE id = ? AND doctor_id = ?
    `).run(id, doctor_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    const updatedSession = db.prepare('SELECT * FROM consultation_sessions WHERE id = ?').get(id);

    // 2. Create health record (Idempotent: One record per session)
    let record = db.prepare('SELECT * FROM health_records WHERE session_id = ?').get(id);
    
    if (!record) {
      const recordInfo = db.prepare(`
        INSERT INTO health_records (patient_id, doctor_id, session_id, diagnosis, consultation_notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(updatedSession.patient_id, doctor_id, id, diagnosis || '', consultation_notes || '');
      
      record = db.prepare('SELECT * FROM health_records WHERE id = ?').get(recordInfo.lastInsertRowid);

      // 3. Copy prescription if exists
      const sessionPrescription = db.prepare('SELECT * FROM prescriptions WHERE session_id = ?').get(id);
      if (sessionPrescription) {
        db.prepare(`
          INSERT OR IGNORE INTO health_record_prescriptions (record_id, medicines, instructions, follow_up)
          VALUES (?, ?, ?, ?)
        `).run(record.id, sessionPrescription.medicines, sessionPrescription.instructions, sessionPrescription.follow_up);
      }
    }

    res.json({
      session: updatedSession,
      record: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete session' });
  }
};

// Simple in-memory rate limiting map: sessionId_senderType -> lastTimestamp
const lastMessageTime = new Map();

exports.sendMessage = (req, res) => {
  try {
    const { id: session_id } = req.params;
    const { sender_type, message } = req.body;

    if (!sender_type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prototype rate limiting (1 msg per sec per sender in a session)
    const rateLimitKey = `${session_id}_${sender_type}`;
    const now = Date.now();
    if (lastMessageTime.has(rateLimitKey)) {
      if (now - lastMessageTime.get(rateLimitKey) < 1000) {
        return res.status(429).json({ error: 'Too many messages, please wait' });
      }
    }
    lastMessageTime.set(rateLimitKey, now);

    // Validate session
    const session = db.prepare('SELECT status FROM consultation_sessions WHERE id = ?').get(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Cannot send messages to a completed session' });
    }

    const info = db.prepare(`
      INSERT INTO consultation_messages (session_id, sender_type, message)
      VALUES (?, ?, ?)
    `).run(session_id, sender_type, message);

    const newMessage = db.prepare('SELECT * FROM consultation_messages WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getMessages = (req, res) => {
  try {
    const { id: session_id } = req.params;
    const messages = db.prepare(`
      SELECT * FROM consultation_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `).all(session_id);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.savePrescription = (req, res) => {
  try {
    const { id: session_id } = req.params;
    const { doctor_id, patient_id, medicines, instructions, follow_up } = req.body;

    const medString = JSON.stringify(medicines || []);
    
    // Check if exists
    const existing = db.prepare('SELECT id FROM prescriptions WHERE session_id = ?').get(session_id);

    if (existing) {
      db.prepare(`
        UPDATE prescriptions 
        SET medicines = ?, instructions = ?, follow_up = ?
        WHERE session_id = ?
      `).run(medString, instructions, follow_up, session_id);
    } else {
      db.prepare(`
        INSERT INTO prescriptions (session_id, doctor_id, patient_id, medicines, instructions, follow_up)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(session_id, doctor_id, patient_id, medString, instructions, follow_up);
    }

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE session_id = ?').get(session_id);
    res.json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
};

exports.getPrescription = (req, res) => {
  try {
    const { id: session_id } = req.params;
    const prescription = db.prepare('SELECT * FROM prescriptions WHERE session_id = ?').get(session_id);
    res.json(prescription || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
};

exports.getSessionSummary = (req, res) => {
  try {
    const { id: session_id } = req.params;

    const session = db.prepare(`
      SELECT s.*, p.name as patient_name, d.name as doctor_name
      FROM consultation_sessions s
      JOIN patients p ON s.patient_id = p.id
      JOIN doctors d ON s.doctor_id = d.id
      WHERE s.id = ?
    `).get(session_id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = db.prepare(`
      SELECT * FROM consultation_messages 
      WHERE session_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `).all(session_id);

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE session_id = ?').get(session_id);

    // If session is completed, fetch the associated health record
    let record = null;
    if (session.status === 'completed') {
      record = db.prepare('SELECT * FROM health_records WHERE session_id = ?').get(session_id);
    }

    res.json({
      session,
      messages: messages.reverse(),
      prescription: prescription || null,
      record: record
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session summary' });
  }
};
