const express = require('express');
const router = express.Router();
const configController = require('./configController');
const blindController = require('./blindController');
const commandController = require('./commandController');

router.get('/config', configController.getConfig);
router.post('/config', configController.updateConfig);
router.post('/blinds', blindController.handleControlCommand);
router.post('/command', commandController.sendCommand);

module.exports = router;