const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

router.post('/receive', smsController.receive);
router.get('/examples', smsController.examples);

module.exports = router;
