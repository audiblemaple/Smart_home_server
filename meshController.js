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
    const { nodeID, action } = req.body;

    // Read config
    const config = await getConfig();
    const token = config.token;
    const rootIp = config.rootNodeIp;

    const url = `${rootNodeIp}/comm?id=${nodeID}&act=${action}&token=${token}`;

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

const fetchNodeIds = async (req, res) => {
    console.log("error fetching node id's");
    const config = await getConfig();
    const rootIp = config.rootNodeIp;
    try {
        const response = await fetch(`${rootNodeIp}/getNodes`);
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
