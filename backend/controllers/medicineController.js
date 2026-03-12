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
    const medicines = db.prepare('SELECT * FROM medicines').all();
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};
