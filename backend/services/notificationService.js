const db = require('../db/database');

function createNotification({ userId, userType, title, message }) {
  if (!userId || !userType || !title || !message) {
    return null;
  }

  const result = db.prepare(
    `INSERT INTO notifications (user_id, user_type, title, message, is_read)
     VALUES (?, ?, ?, ?, 0)`
  ).run(userId, userType, title, message);

  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
}

module.exports = { createNotification };