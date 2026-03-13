const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.post('/login', workerController.login);
router.post('/register-patient', workerController.registerPatient);
router.post('/vitals', workerController.uploadVitals);
router.get('/patient-search', workerController.getPatientByPhone);
router.get('/:id/history', workerController.getWorkerVitalsHistory);

module.exports = router;
