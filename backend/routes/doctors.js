const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/', doctorController.getAll);
router.get('/available', doctorController.getAvailable);
router.patch('/:id/toggle', doctorController.toggleAvailability);

module.exports = router;
