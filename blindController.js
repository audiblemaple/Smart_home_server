/**
 * Handles control commands for the blinds, supporting actions like 'open', 'close', and 'stop'.
 *
 * @async
 * @function handleControlCommand
 * @param {Object} req - The request object, containing the action and slot in its body.
 * @param {Object} res - The response object, used for sending back the status of the action.
 * @description
 * This function reads an 'action' and 'node' from the request body. Based on the action
 * ('open', 'close', 'stop'), it performs the corresponding operation. If the action is
 * invalid, it sends a 400 response with an 'Invalid action' message. In case of successful
 * execution of the action, it sends a confirmation message. Errors are caught and logged,
 * and an 'Internal Server Error' message is sent.
 */
const handleControlCommand = async (req, res) => {
    try {
        const { action, node } = req.body;

        switch (action) {
            case 'open':
                console.log("opening....");
                break;
            case 'close':
                console.log("closing....");
                break;
            case 'stop':
                console.log("stopping....");
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        res.json({ message: `Action ${action} for slot ${node} executed successfully` });
    } catch (error) {
        console.error('Error in handling control command:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    handleControlCommand,
};
