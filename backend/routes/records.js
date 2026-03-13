const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');

router.get('/patient/:id', recordsController.getPatientRecords);
router.post('/', recordsController.createRecord);
router.patch('/:id', recordsController.updateRecord);
router.post('/:id/lab-report', recordsController.addLabReport);

module.exports = router;
