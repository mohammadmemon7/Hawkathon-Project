const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');

router.post('/new', consultationController.create);
router.get('/pending', consultationController.getPending);
router.get('/:id', consultationController.getOne);
router.patch('/:id', consultationController.update);
router.patch('/:id/complete', consultationController.complete);

module.exports = router;
