const db = require('../db/database');

exports.getByUser = async (req, res, next) => {
  try {
    const { userType } = req.query;
    let notifications;

    if (userType) {
      notifications = db.prepare(
        `SELECT * FROM notifications
         WHERE user_id = ? AND user_type = ?
         ORDER BY is_read ASC, created_at DESC`
      ).all(req.params.userId, userType);
    } else {
      notifications = db.prepare(
        `SELECT * FROM notifications
         WHERE user_id = ?
         ORDER BY is_read ASC, created_at DESC`
      ).all(req.params.userId);
    }

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    const updatedNotification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);

    res.json(updatedNotification);
  } catch (err) {
    next(err);
  }
};