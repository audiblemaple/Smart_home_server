const fs = require('fs').promises;
const path = require('path');

const updateConfig = async (req, res) => {
    console.log(req.body)
    try {
        const { slot, isOn } = req.body;
        const configDir = 'D:\\smart_home_server';
        const configPath = path.join(configDir, 'hotspotConfig.json');

        let config = JSON.parse(await fs.readFile(configPath, 'utf8'));

        // Check if the slot exists in the config and update its 'isOn' value
        if (config.hasOwnProperty(slot)) {
            config[slot].isOn = isOn;
        } else {
            // Handle the case where the slot doesn't exist in the config
            return res.status(404).json({ message: 'Slot not found' });
        }

        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        res.status(200).json({ message: 'Hotspot config updated successfully' });
    } catch (error) {
        console.error('Error updating the hotspot config:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getConfig = async (req, res) => {
    try {
        const configPath = path.join('D:\\smart_home_server', 'hotspotConfig.json');
        const rawConfig = await fs.readFile(configPath, 'utf8');
        console.log('Raw config:', rawConfig); // Log the raw file content
        const config = JSON.parse(rawConfig);
        res.status(200).json(config);
    } catch (error) {
        console.error('Error fetching the config file:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { updateConfig, getConfig };