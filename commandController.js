let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;
})();
const sendCommand = async (req, res) => {
    const { nodeID, action, token } = req.body;

    // Construct the new URL
    const url = `http://192.168.1.115/comm?id=${nodeID}&act=${action}&token=${token}`;

    // Send the GET request to the new URL
    fetch(url)
        .then(response => response.text())
        .then(result => {
            console.log('Request sent successfully', result);
            res.status(200).send({ message: 'Command forwarded successfully' });
        })
        .catch(error => {
            console.error('Error forwarding command:', error);
            // You can choose a different status code based on the error type.
            // For this example, I'm using 500 (Internal Server Error).
            res.status(500).send({ message: 'Error forwarding command' });
        });
};

module.exports = { sendCommand };
