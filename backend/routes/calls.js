const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// POST /api/calls/request
router.post('/request', callController.requestCall);

// PATCH /api/calls/:id/cancel
router.patch('/:id/cancel', callController.cancelCall);

module.exports = router;
