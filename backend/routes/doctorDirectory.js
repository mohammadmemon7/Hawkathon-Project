const express = require('express');
const router = express.Router();
const doctorDirectoryController = require('../controllers/doctorDirectoryController');

router.get('/', doctorDirectoryController.getAllDoctors);

module.exports = router;
