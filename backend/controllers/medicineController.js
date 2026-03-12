const db = require('../db/database');

exports.search = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name query parameter is required' });

    const medicines = db.prepare(
      'SELECT * FROM medicines WHERE name LIKE ? ORDER BY available DESC, distance_km ASC'
    ).all(`%${name}%`);
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) AS count FROM medicines').get().count;
    const medicines = db.prepare('SELECT * FROM medicines LIMIT ? OFFSET ?').all(limit, offset);

    res.json({ data: medicines, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
