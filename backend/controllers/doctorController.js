const db = require('../db/database');

exports.getAll = async (req, res, next) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors').all();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

exports.getAvailable = async (req, res, next) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors WHERE available = 1').all();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    db.prepare('UPDATE doctors SET available = CASE WHEN available = 1 THEN 0 ELSE 1 END WHERE id = ?').run(req.params.id);
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};
