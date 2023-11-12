const fs = require('fs').promises;
const path = require('path');
const lockfile = require('proper-lockfile');

const configPath = path.join(__dirname, 'hotspotConfig.json');

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

module.exports = { updateConfig, getConfig };









// const fs = require('fs').promises;
// const path = require('path');
//
// const updateConfig = async (req, res) => {
//     try {
//         const { slot, isOn } = req.body;
//
//         const configPath = path.join(__dirname, 'hotspotConfig.json');
//         const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
//
//         if (config.hasOwnProperty(slot)) {
//             config[slot].isOn = isOn;
//             await fs.writeFile(configPath, JSON.stringify(config, null, 2));
//             res.status(200).json({ message: 'Hotspot config updated successfully'});
//         } else
//             res.status(404).json({ message: 'Slot not found' });
//     } catch (error) {
//         console.error('Error updating the hotspot config:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
//
// const getConfig = async (req, res) => {
//     try {
//         const configPath = path.join(__dirname, 'hotspotConfig.json');
//         const rawConfig = await fs.readFile(configPath, 'utf8');
//         console.log('Raw config:', rawConfig);
//         const config = JSON.parse(rawConfig);
//         res.status(200).json(config);
//     } catch (error) {
//         console.error('Error fetching the config file:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
//
// module.exports = { updateConfig, getConfig };