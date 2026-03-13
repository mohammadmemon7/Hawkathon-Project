const express = require('express');
const router = express.Router();
const controller = require('../controllers/symptomCheckerController');

router.post('/analyze', controller.analyze);

module.exports = router;
