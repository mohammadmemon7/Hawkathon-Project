const db = require('../db/database');

exports.getAllDoctors = (req, res) => {
  try {
    const { 
      search, 
      specialization, 
      availableNow, 
      status, 
      minRating, 
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (specialization) {
      query += ' AND specialization = ?';
      params.push(specialization);
    }

    if (availableNow === 'true' || availableNow === '1') {
      query += ' AND available = 1';
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (minRating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(minRating));
    }

    // Sorting
    if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else if (sort === 'experience') {
      query += ' ORDER BY experience_years DESC';
    } else if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += " ORDER BY available DESC, status = 'online' DESC, rating DESC";
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    // Strip ORDER BY for count query
    countQuery = countQuery.split(' ORDER BY ')[0];
    const total = db.prepare(countQuery).get(...params).total;

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const data = db.prepare(query).all(...params);

    res.json({
      data,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctor directory' });
  }
};
