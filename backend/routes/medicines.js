const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/search', medicineController.search);
router.get('/pharmacies', medicineController.summarizeByPharmacy);
router.get('/all', medicineController.getAll);
router.get('/last-updated', medicineController.getLastUpdated);
router.patch('/:id', medicineController.update);
router.post('/:id/feedback', medicineController.submitFeedback);

module.exports = router;
