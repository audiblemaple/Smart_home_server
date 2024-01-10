/*
 * Copyright (c) 2024 Lior Jigalo.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @fileoverview This file includes the server's config file functionality.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license GPLv3
 */

const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');

const configPath = path.join(__dirname, 'hotspotConfig.json');


/**
 * Reads the configuration file and returns its content.
 * @async
 * @function readConfig
 * @returns {Promise<Object>} The parsed configuration object.
 */
const readConfig = async () => {
    const rawConfig = await fs.readFile(configPath, 'utf8');
    return JSON.parse(rawConfig);
};

/**
 * Writes the updated configuration to the file.
 * @async
 * @function writeConfig
 * @param {Object} config - The configuration object to be written to the file.
 */
const writeConfig = async (config) => {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
};

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
 * Asynchronously adds a new hotspot entry to the configuration file.<br>
 * This function performs several key operations:<br>
 * - Acquires a lock on the configuration file to prevent concurrent writes.<br>
 * - Reads the existing configuration from the file.<br>
 * - Generates a unique ID for the new hotspot based on the existing IDs.<br>
 * - Adds the new hotspot data (received in the request body) to the configuration.<br>
 * - Writes the updated configuration back to the file.<br>
 * - Sends a response back to the client indicating the result of the operation.<br>
 * - Releases the file lock.<br>
 *
 * @async
 * @function addHotspot
 * @param {Object} req - The request object from Express.js, containing the new hotspot data in `req.body`.
 * @param {Object} res - The response object from Express.js, used to send back the operation status.
 * @throws {Error} Throws an error if there is a problem reading from or writing to the config file, or if acquiring or releasing the lock fails.
 */
const addHotspot = async (req, res) => {
    let releaseLock;
    try {
        releaseLock = await lockfile.lock(configPath, { // Acquire a lock on the config file
            retries: {
                retries: 6,
                maxTimeout: 1000,
            }
        });

        // Read the current configuration
        const rawConfig = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(rawConfig);
        const newHotspotData = req.body;

        // Generate a unique ID for the new hotspot
        const hotspotNumbers = Object.keys(config)
            .map(key => parseInt(key.replace('hotspot-', ''), 10))
            .sort((a, b) => a - b);
        const nextNumber = hotspotNumbers.length === 0 ? 1 : hotspotNumbers[hotspotNumbers.length - 1] + 1;
        const newHotspotId = `hotspot-${nextNumber}`;

        // Add the new hotspot to the config
        config[newHotspotId] = newHotspotData;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));

        // Send success response
        res.status(200).json({ message: 'Hotspot added successfully', id: newHotspotId });
    } catch (error) {
        console.error('Error adding new hotspot:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (releaseLock) { // Release the file lock
            try {
                await releaseLock();
            } catch (unlockError) {
                console.error('Error releasing file lock:', unlockError);
            }
        }
    }
};

/**
 * Asynchronously updates the lighting configuration for a specified node.<br>
 * This function performs several key operations:<br>
 * - Validates the provided `nodeID` and `isOn` parameters.<br>
 * - Acquires a lock on the configuration file to prevent concurrent writes.<br>
 * - Reads and parses the existing configuration from the file.<br>
 * - Updates the 'isOn' status for the specified `nodeID` in the configuration.<br>
 * - Writes the updated configuration back to the file.<br>
 * - Logs the result of the operation to the console.<br>
 * - Releases the file lock.<br>
 *
 * @async
 * @param  {string} nodeID - The unique identifier of the light hotspot.
 * @param  {boolean} isOn - The new state (on/off) of the light hotspot.
 * @throws {Error} Throws an error if any step of the process fails.
 */
const updateLight = async (nodeID, isOn) => {
    let releaseLock;
    try {
        if (!nodeID || typeof isOn !== 'boolean') { // Input validation
            console.error('Invalid input data');
            return;
        }

        releaseLock = await lockfile.lock(configPath, { // Acquire file lock
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

        for (const hotspotKey in config) { // find the node id
            if (config.hasOwnProperty(hotspotKey) && config[hotspotKey].nodeID === nodeID) {
                config[hotspotKey].isOn = isOn;
                await fs.writeFile(configPath, JSON.stringify(config, null, 2));
                console.log('Hotspot config updated successfully', config[hotspotKey]);
                return;
            }
        }

    } catch (error) {
        console.error('Error updating the hotspot config:', error);
    } finally {
        if (releaseLock) { // Release the file lock
            try {
                await releaseLock();
            } catch (unlockError) {
                console.error('Error releasing file lock:', unlockError);
            }
        }
    }
};

module.exports = { updateConfig, getConfig, addHotspot, updateLight };