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
    res.set('Cache-Control', 'public, max-age=300'); // 5 minute caching for medicine list

    // Backward compatibility: If no page parameter, return raw array.
    if (!req.query.page) {
       const medicines = db.prepare('SELECT * FROM medicines').all();
       return res.json(medicines);
    }

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

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available, stock_count, price } = req.body;
    
    db.prepare(`
      UPDATE medicines 
      SET available = ?, stock_count = ?, price = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(available, stock_count, price, id);
    
    const updated = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.getLastUpdated = async (req, res, next) => {
  try {
    const latest = db.prepare('SELECT MAX(last_updated) as last_updated FROM medicines').get();
    res.json(latest);
  } catch (err) {
    next(err);
  }
};

