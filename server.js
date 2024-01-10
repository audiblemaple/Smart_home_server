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
 * @fileoverview This file includes the main server functionality.
 * @author Lior Jigalo
 * @version 1.0.0
 * @license GPLv3
 */

const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const { readFileSync } = require("fs");
const fs = require('fs');
const e = require("express");
const WebSocket = require('ws');

const configController = require('./configController');

/**
 * Reads and parses the server configuration from a JSON file.
 */
const config = JSON.parse(readFileSync('serverConfig.json', 'utf8'));
let ws;

/**
 * Middleware setup for the Express application.
 * Includes JSON parser, CORS configuration, and API routes.
 */
app.use(express.json());
app.use(cors());
app.use('/api', routes);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Adjust accordingly for production
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/**
 * Server port configuration and initialization.
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/**
 * Get the current timestamp in the format "DD/MM/YY HH:mm:ss".
 * @returns {string} The formatted timestamp.
 */
function getTimeStamp() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * Logs a message to a file with a timestamp.
 * @param {string} message - The message to be logged.
 */
function logMessage(message) {
    const timestamp = getTimeStamp();
    const logEntry = `${timestamp} -> ${message}\n`;
    console.log(logEntry);
    fs.appendFile('log.txt', logEntry, err => {
        if (err) {
            console.error('Error writing to log file', err);
        }
    });
}

/**
 * Initializes the WebSocket connection and sets up event handlers.
 */
function connect() {
    ws = new WebSocket(config.rootNodeWS);

    ws.on('open', function open() {
        console.log('WebSocket established');
    });

    ws.on('message', function incoming(data) {
        if ( data.toString().includes("light_report") ){
            let messageArgs = data.toString().split(":");
            configController.updateLight(messageArgs[0], messageArgs[2] === "true");
        }
        logMessage(`${data}`);
    });

    ws.on('close', function close() {
        console.log('WebSocket connection dropped');
        // Reconnect after a delay
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
        }, 2000); // Reconnect after 2 seconds
    });

    ws.on('error', function error(error) {
        console.error('WebSocket error:', error);
        ws.close(); // Ensure the 'close' event is triggered
    });
}

// Initial connection
connect();
