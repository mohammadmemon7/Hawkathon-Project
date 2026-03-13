const db = require('../db/database');

exports.search = async (req, res, next) => {
  try {
    const { name, availableOnly, maxDistanceKm, sort, page: pageStr, limit: limitStr } = req.query;
    if (!name) return res.status(400).json({ error: 'name query parameter is required' });

    let whereClauses = ['name LIKE ?'];
    const params = [`%${name}%`];

    if (availableOnly === '1') {
      whereClauses.push('available = 1 AND stock_count > 0');
    }

    if (maxDistanceKm) {
        whereClauses.push('distance_km <= ?');
        params.push(parseFloat(maxDistanceKm));
    }

    const whereSql = whereClauses.join(' AND ');

    // Sort mapping to prevent injection and provide defaults
    const sortMap = {
      distance: 'distance_km ASC',
      price: 'price ASC',
      stock: 'stock_count DESC'
    };
    const orderBy = sortMap[sort] || 'available DESC, distance_km ASC';

    // Pagination check for backward compatibility
    const page = parseInt(pageStr);
    const limit = parseInt(limitStr);

    if (isNaN(page) || isNaN(limit)) {
      const medicines = db.prepare(`SELECT * FROM medicines WHERE ${whereSql} ORDER BY ${orderBy}`).all(...params);
      return res.json(medicines);
    }

    // Paginated search
    const offset = (page - 1) * limit;
    const total = db.prepare(`SELECT COUNT(*) AS count FROM medicines WHERE ${whereSql}`).get(...params).count;
    
    const medicines = db.prepare(`SELECT * FROM medicines WHERE ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, limit, offset);

    // Calculate latest update in this batch
    const last_updated_max = medicines.reduce((max, med) => {
      if (!max || new Date(med.last_updated) > new Date(max)) return med.last_updated;
      return max;
    }, null);

    res.json({
      data: medicines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      last_updated_max
    });
  } catch (err) {
    next(err);
  }
};

exports.summarizeByPharmacy = async (req, res, next) => {
  try {
    const { name, availableOnly, maxDistanceKm } = req.query;
    if (!name) return res.status(400).json({ error: 'name query parameter is required' });

    let whereClauses = ['name LIKE ?'];
    const params = [`%${name}%`];

    if (availableOnly === '1') {
      whereClauses.push('available = 1 AND stock_count > 0');
    }

    if (maxDistanceKm) {
        whereClauses.push('distance_km <= ?');
        params.push(parseFloat(maxDistanceKm));
    }

    const whereSql = whereClauses.join(' AND ');
    
    // Fetch all matching medicines
    const medicines = db.prepare(`SELECT * FROM medicines WHERE ${whereSql}`).all(...params);

    // Group by pharmacy
    const pharmacyGroups = {};

    medicines.forEach(m => {
        const key = `${m.pharmacy_name}|${m.village}`;
        if (!pharmacyGroups[key]) {
            pharmacyGroups[key] = {
                pharmacy_name: m.pharmacy_name,
                village: m.village,
                distance_km: m.distance_km,
                available_count: 0,
                out_of_stock_count: 0,
                items: []
            };
        }
        
        pharmacyGroups[key].items.push(m);
        if (m.available === 1 && m.stock_count > 0) {
            pharmacyGroups[key].available_count++;
        } else {
            pharmacyGroups[key].out_of_stock_count++;
        }
    });

    // Convert to array and sort
    const result = Object.values(pharmacyGroups).sort((a, b) => {
        if (a.distance_km !== b.distance_km) {
            return a.distance_km - b.distance_km;
        }
        return b.available_count - a.available_count;
    });

    res.json(result);
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
    const current = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ error: 'Medicine not found' });

    let { available, stock_count, price } = req.query; // Check query or body? Typically body for PATCH.
    // Switching to req.body as per standard practices for PATCH
    ({ available, stock_count, price } = req.body);

    // Partial update logic: use existing values if not provided
    const newStock = stock_count !== undefined ? parseInt(stock_count) : current.stock_count;
    const newPrice = price !== undefined ? parseInt(price) : current.price;
    let newAvailable = available !== undefined ? parseInt(available) : current.available;

    // Rule: available should auto-be 0 if stock_count <= 0
    if (newStock <= 0) {
      newAvailable = 0;
    }
    
    db.prepare(`
      UPDATE medicines 
      SET available = ?, stock_count = ?, price = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newAvailable, newStock, newPrice, id);
    
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

exports.submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { patient_id, reported_available, comment } = req.body;
    
    const result = db.prepare(`
        INSERT INTO medicine_feedback (medicine_id, patient_id, reported_available, comment)
        VALUES (?, ?, ?, ?)
    `).run(id, patient_id, reported_available, comment);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
};

