/**
 * @fileoverview This file includes the main server's route declarations.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const router = express.Router();
const configController = require('./configController');
const blindController = require('./blindController');
const meshController = require('./meshController');

/**
 * Route serving the configuration.
 * @name get/config
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to get the configuration
 */
router.get('/config', configController.getConfig);

/**
 * Route to update the configuration.
 * @name post/config
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to update the configuration
 */
router.post('/config', configController.updateConfig);

/**
 * Route to update the light configuration.
 * @name post/configLightUpdate
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to update the light settings
 */
router.post('/configLightUpdate', configController.updateLight);

/**
 * Route for blind control commands.
 * @name post/blinds
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to handle blind control commands
 */
router.post('/blinds', blindController.handleControlCommand);

/**
 * Route to send a command to the mesh network.
 * @name post/command
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to send commands
 */
router.post('/command', meshController.sendCommand);

/**
 * Route to fetch node IDs from the mesh network.
 * @name get/getNodeIds
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Middleware function to fetch node IDs
 */
router.get('/getNodeIds', meshController.fetchNodeIds);

module.exports = router;
