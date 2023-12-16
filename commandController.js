let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();

// Synchronously read the JSON file
const configData = fs.readFileSync('serverConfig.json');
const config = JSON.parse(configData);

const token = config.token;
const rootIp = config.rootIp;

const sendCommand = async (req, res) => {
    const { nodeID, action, token } = req.body;

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
            // You can choose a different status code based on the error type.
            // For this example, I'm using 500 (Internal Server Error).
            res.status(500).send({ message: 'Error sending command' });
        });
};

module.exports = { sendCommand };
