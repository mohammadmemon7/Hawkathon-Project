const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.post('/', appointmentController.create);
router.get('/patient/:id', appointmentController.getPatientAppointments);
router.get('/doctor/:id', appointmentController.getDoctorAppointments);
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/cancel', appointmentController.cancel);

module.exports = router;