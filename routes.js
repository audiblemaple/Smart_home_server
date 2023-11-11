const express = require('express');
const router = express.Router();
const configController = require('./configController');

router.get('/config', configController.getConfig);
router.post('/config', configController.updateConfig);

module.exports = router;
