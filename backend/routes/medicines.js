const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/search', medicineController.search);
router.get('/all', medicineController.getAll);

module.exports = router;
