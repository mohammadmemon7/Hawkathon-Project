const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

router.post('/request', callController.requestCall);
router.get('/patient/:id', callController.getPatientCalls);
router.get('/pending', callController.getPendingCalls);
router.patch('/:id/accept', callController.acceptCall);
router.patch('/:id/complete', callController.completeCall);

module.exports = router;
