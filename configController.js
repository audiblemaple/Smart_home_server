/**
 * @fileoverview This file includes the server's config file functionality.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');

const configPath = path.join(__dirname, 'hotspotConfig.json');

/**
 * Updates the configuration for a specified node.
 * @async
 * @function updateConfig
 * @param {Object} req - The request object containing the slot and isOn properties.
 * @param {Object} res - The response object for sending back the update status.
 */
const updateConfig = async (req, res) => {
    let releaseLock;
    try {
        releaseLock = await lockfile.lock(configPath, {
            retries: {
                retries: 6,
                maxTimeout: 1000,
            }
        });

        const rawConfig = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(rawConfig);

        const { slot, isOn } = req.body;
        if (config.hasOwnProperty(slot)) {
            config[slot].isOn = isOn;
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            res.status(200).json({ message: 'Hotspot config updated successfully' });
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (error) {
        console.error('Error updating the hotspot config:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (releaseLock) {
            try {
                await releaseLock();
            } catch (unlockError) {
                console.error('Error releasing file lock:', unlockError);
            }
        }
    }
};

/**
 * Retrieves the current configuration file with the statuses of all the nodes.
 * @async
 * @function getConfig
 * @param {Object} req - The request object (not used in this function).
 * @param {Object} res - The response object for sending back the configuration.
 */
const getConfig = async (req, res) => {
    try {
        const configPath = path.join(__dirname, 'hotspotConfig.json');
        const rawConfig = await fs.readFile(configPath, 'utf8');
        console.log('Raw config:', rawConfig);
        const config = JSON.parse(rawConfig);
        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching the config file:', error);
        res.status(500).send('Internal Server Error');
    }
};





/**
 * Asynchronously updates the lighting configuration for a specified node.
 *
 * This function performs several key operations:
 * - Validates the provided `nodeID` and `isOn` parameters.
 * - Acquires a lock on the configuration file to prevent concurrent writes.
 * - Reads and parses the existing configuration from the file.
 * - Updates the 'isOn' status for the specified `nodeID` in the configuration.
 * - Writes the updated configuration back to the file.
 * - Logs the result of the operation to the console.
 * - Releases the file lock.
 *
 * @param {string} nodeID - The unique identifier for the node to be updated. This should be a non-empty string.
 * @param {boolean} isOn - The new status to be set for the node. True to turn the node on, false to turn it off.
 */
const updateLight = async (nodeID, isOn) => {
    let releaseLock;
    try {
        // Input validation
        if (!nodeID || typeof isOn !== 'boolean') {
            console.error('Invalid input data');
            return;
        }

        // Acquire file lock
        releaseLock = await lockfile.lock(configPath, {
            retries: { retries: 6, maxTimeout: 1000 }
        });

        // Read and parse configuration
        const rawConfig = await fs.readFile(configPath, 'utf8');
        let config;
        try {
            config = JSON.parse(rawConfig);
        } catch (parseError) {
            console.error('Error parsing the config file:', parseError);
            return;
        }

        // Update configuration
        if (config.hasOwnProperty(nodeID)) {
            config[nodeID].isOn = isOn;
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            console.log('Hotspot config updated successfully', config[nodeID]);
        } else {
            console.error('Node ID not found');
        }
    } catch (error) {
        console.error('Error updating the hotspot config:', error);
    } finally {
        // Release the file lock
        if (releaseLock) {
            try {
                await releaseLock();
            } catch (unlockError) {
                console.error('Error releasing file lock:', unlockError);
            }
        }
    }
};















/**
 * Updates the light status for a specified node ID in the configuration file, if the node is not present then return a message with 400 code.
 * @async
 * @function updateLight
 * @param {Object} req - The request object containing the nodeID and isOn properties.
 * @param {Object} res - The response object for sending back the update status.
 */
// const updateLight = async (req, res) => {
//     let releaseLock;
//     try {
//         // Input validation
//         const { nodeID, isOn } = req.body;
//         if (!nodeID || typeof isOn !== 'boolean')
//             return res.status(400).json({ message: 'Invalid input data' });
//
//         // Acquire file lock
//         releaseLock = await lockfile.lock(configPath, {
//             retries: { retries: 6, maxTimeout: 1000 }
//         });
//
//         // Read and parse configuration
//         const rawConfig = await fs.readFile(configPath, 'utf8');
//         let config;
//         try {
//             config = JSON.parse(rawConfig);
//         } catch (parseError) {
//             console.error('Error parsing the config file:', parseError);
//             return res.status(500).json({ message: 'Error parsing the configuration file' });
//         }
//
//         // Update configuration
//         if (config.hasOwnProperty(nodeID)) {
//             config[nodeID].isOn = isOn;
//             await fs.writeFile(configPath, JSON.stringify(config, null, 2));
//             res.status(200).json({ message: 'Hotspot config updated successfully', updatedConfig: config[nodeID] });
//         } else
//             res.status(404).json({ message: 'Node ID not found' });
//     } catch (error) {
//         console.error('Error updating the hotspot config:', error);
//         res.status(500).send('Internal Server Error');
//     } finally {
//         // Release the file lock
//         if (releaseLock) {
//             try {
//                 await releaseLock();
//             } catch (unlockError) {
//                 console.error('Error releasing file lock:', unlockError);
//             }
//         }
//     }
// };

module.exports = { updateConfig, getConfig, updateLight };
