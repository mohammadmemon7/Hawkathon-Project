const db = require('../db/database');

exports.getAll = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute caching for doctor list

    // Backward compatibility: If no page parameter is sent, return raw array.
    if (!req.query.page) {
      const doctors = db.prepare('SELECT * FROM doctors').all();
      return res.json(doctors);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) AS count FROM doctors').get().count;
    const doctors = db.prepare('SELECT * FROM doctors LIMIT ? OFFSET ?').all(limit, offset);

    res.json({ data: doctors, page, limit, total, totalPages: Math.ceil(total / limit) });
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
