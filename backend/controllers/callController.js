const db = require('../db/database');

const requestCall = (req, res, next) => {
  try {
    const { patient_id, doctor_id, call_type, scheduled_at } = req.body;
    
    if (!patient_id || !call_type) {
      return res.status(400).json({ error: 'patient_id and call_type (video/audio) are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO call_requests (patient_id, doctor_id, call_type, scheduled_at)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(patient_id, doctor_id || null, call_type, scheduled_at || null);
    
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      patient_id, 
      doctor_id, 
      call_type, 
      status: 'requested',
      scheduled_at,
      message: 'Call requested successfully' 
    });
  } catch (error) {
    next(error);
  }
};

const getPendingCalls = (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT c.*, p.name as patient_name, p.phone as patient_phone 
      FROM call_requests c
      JOIN patients p ON c.patient_id = p.id
      WHERE c.status = 'requested'
      ORDER BY c.created_at ASC
    `);

    const calls = stmt.all();
    res.json(calls);
  } catch (error) {
    next(error);
  }
};

const acceptCall = (req, res, next) => {
  try {
    const callId = req.params.id;
    const { doctor_id } = req.body; // optionally assign answering doctor if it wasn't pre-assigned
    
    // In a real app we might verify doctor_id auth token.
    let stmt;
    if (doctor_id) {
       stmt = db.prepare(`
        UPDATE call_requests 
        SET status = 'active', started_at = CURRENT_TIMESTAMP, doctor_id = ?
        WHERE id = ? AND status = 'requested'
      `);
      stmt.run(doctor_id, callId);
    } else {
       stmt = db.prepare(`
        UPDATE call_requests 
        SET status = 'active', started_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'requested'
      `);
      stmt.run(callId);
    }

    const updated = db.prepare(`SELECT * FROM call_requests WHERE id = ?`).get(callId);
    
    if (!updated || updated.status !== 'active') {
      return res.status(404).json({ error: 'Call request not found or already accepted' });
    }

    res.json({ message: 'Call accepted', call: updated });
  } catch (error) {
    next(error);
  }
};

const completeCall = (req, res, next) => {
  try {
    const callId = req.params.id;
    const { status } = req.body; // 'completed' or 'missed'

    const finalStatus = status === 'missed' ? 'missed' : 'completed';

    const stmt = db.prepare(`
      UPDATE call_requests 
      SET status = ?, ended_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status IN ('requested', 'active')
    `);
    
    const result = stmt.run(finalStatus, callId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Call request not found or cannot be completed' });
    }

    const updated = db.prepare(`SELECT * FROM call_requests WHERE id = ?`).get(callId);
    res.json({ message: `Call marked as ${finalStatus}`, call: updated });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestCall,
  getPendingCalls,
  acceptCall,
  completeCall
};
