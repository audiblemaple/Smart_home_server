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
 * @fileoverview This file includes the server's log file functionality.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license GPLv3
 */

const fs = require('fs');
const path = require('path');

// Define the path to the log file
const logFilePath = path.join(__dirname, 'log.txt'); // Change the path as needed

/**
 * Fetch and send the contents of the log file as a response.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const fetchLogFile = (req, res) => {
    // Read the log file
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading the log file');
        } else {s
            // Set the response headers for downloading the file
            res.setHeader('Content-disposition', 'attachment; filename=log.txt');
            res.setHeader('Content-type', 'text/plain');
            res.send(data);
        }
    });
};

module.exports = { fetchLogFile };