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

const sendCommand = async (req, res) => {
    const { nodeID, action } = req.body; // Remove token from here

    // Read config
    const config = await getConfig();
    const token = config.token;
    const rootIp = config.rootIp;

    const url = `http://${rootIp}/comm?id=${nodeID}&act=${action}&token=${token}`;

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

module.exports = { sendCommand };
