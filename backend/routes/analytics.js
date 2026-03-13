const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/village-risk', analyticsController.getVillageRisk);
router.get('/disease-trend', analyticsController.getDiseaseTrend);
router.get('/summary', analyticsController.getSummary);

module.exports = router;
