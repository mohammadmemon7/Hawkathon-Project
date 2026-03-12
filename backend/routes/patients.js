const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/register', patientController.register);
router.get('/:phone', patientController.getByPhone);
router.get('/:id/history', patientController.getHistory);

module.exports = router;
