const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments
router.post('/', appointmentController.create);

// GET /api/appointments/patient/:id
router.get('/patient/:id', appointmentController.getByPatient);

// GET /api/appointments/doctor/:id
router.get('/doctor/:id', appointmentController.getByDoctor);

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', appointmentController.cancel);

module.exports = router;