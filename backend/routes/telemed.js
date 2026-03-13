const express = require('express');
const router = express.Router();
const telemedController = require('../controllers/telemedController');

// Patient endpoints
router.post('/sessions', telemedController.createSession);
router.get('/sessions/patient/:id', telemedController.getPatientSessions);

// Doctor endpoints
router.get('/sessions/doctor/:id', telemedController.getDoctorSessions);
router.patch('/sessions/:id/accept', telemedController.acceptSession);
router.patch('/sessions/:id/complete', telemedController.completeSession);

// Chat endpoints
router.post('/sessions/:id/messages', telemedController.sendMessage);
router.get('/sessions/:id/messages', telemedController.getMessages);

// Prescription endpoints
router.post('/sessions/:id/prescription', telemedController.savePrescription);
router.get('/sessions/:id/prescription', telemedController.getPrescription);

// Summary endpoint
router.get('/sessions/:id/summary', telemedController.getSessionSummary);

module.exports = router;
