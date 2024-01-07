const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const { readFileSync } = require("fs");
const fs = require('fs');
const e = require("express");
const WebSocket = require('ws');

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
 * Generates a timestamp in DD/MM/YY HH:MM:SS format.
 * @returns {string} The formatted timestamp.
 */
function getTimeStamp() {
    let now = new Date();
    let seconds = String(now.getSeconds()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let year = String(now.getFullYear()).slice(-2);
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Logs a message to a file with a timestamp.
 * @param {string} message - The message to be logged.
 */
function logMessage(message) {
    const timestamp = getTimeStamp();
    const logEntry = `${timestamp} -> ${message}\n`;
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
        console.log('Received: %s', data);
        logMessage(`Received: ${data}`);
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
