const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.create);
router.get('/patient/:id', appointmentController.getByPatient);
router.get('/doctor/:id', appointmentController.getByDoctor);
router.patch('/:id/cancel', appointmentController.cancel);

module.exports = router;