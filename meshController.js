/**
 * @fileoverview This file includes the main meshes interface functionality.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license MIT
 */

let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

const fs = require('fs').promises;
const path = require('path');

// Define the path to the configuration file
const configPath = path.join(__dirname, 'serverConfig.json');

// Function to read and parse the configuration file
async function getConfig() {
    const configFile = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configFile);
}

/**
 * Sends a command to a node in the mesh network.
 *
 * @async
 * @function sendCommand
 * @param {Object} req - The request object, containing the nodeID and action in its body.
 * @param {Object} res - The response object, used for sending back the request status.
 */
const sendCommand = async (req, res) => {
    const { nodeID, action } = req.body;

    // Read config
    const config = await getConfig();
    const token = config.token;

    const url = `${config.rootNodeIp}/comm?id=${nodeID}&act=${action}&token=${token}`;

    // Send the GET request to the new URL
    fetch(url)
        .then(response => response.text())
        .then(result => {
            console.log('Request sent successfully', result);
            res.status(200).send({ message: 'Command sent successfully' });
        })
        .catch(error => {
            console.error('Error sending command:', error);
            res.status(500).send({ message: 'Error sending command' });
        });
};

/**
 * Fetches the IDs of nodes from the mesh network.
 *
 * @async
 * @function fetchNodeIds
 * @param {Object} req - The request object (not used in the function).
 * @param {Object} res - The response object, used for sending back the node IDs or an error message.
 */
const fetchNodeIds = async (req, res) => {
    console.log("error fetching node id's");
    const config = await getConfig();
    try {
        const response = await fetch(`${config.rootNodeIp}/getNodes`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const json = await response.json();
        console.log(json);

        res.status(200).send({success: true, list: json});
    } catch (error) {
        console.log(error);
        res.status(404).send({success: false, error:error});
    } finally {
        console.log("loading...");
    }
};

module.exports = { sendCommand, fetchNodeIds };
