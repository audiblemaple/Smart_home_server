const express = require('express');
const router = express.Router();
const configController = require('./configController');
const blindController = require('./blindController');
const meshController = require('./meshController');

router.get( '/config', configController.getConfig);
router.post('/config', configController.updateConfig);
router.post('/configLightUpdate', configController.updateLight);
router.post('/blinds', blindController.handleControlCommand);
router.post('/command', meshController.sendCommand);
router.get( '/getNodeIds', meshController.fetchNodeIds);

module.exports = router;