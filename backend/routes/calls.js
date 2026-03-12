const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/callController');

router.post('/request', ctrl.requestCall);
router.get('/pending', ctrl.getPendingCalls);
router.patch('/:id/accept', ctrl.acceptCall);
router.patch('/:id/complete', ctrl.completeCall);

module.exports = router;
