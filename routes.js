const express = require('express');
const router = express.Router();
const configController = require('./configController');
const blindController = require('./blindController');

router.get('/config', configController.getConfig);
router.post('/config', configController.updateConfig);
router.post('/blinds', blindController.handleControlCommand); // Removed '/api' prefix

module.exports = router;
