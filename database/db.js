const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.json');

module.exports = {
    load: function(guildId) {
        try {
            if (!guildId) return {};
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8') || '{}');
            // Ensure we use String(guildId) to match the key
            return data[String(guildId)] || {}; 
        } catch (err) {
            return {};
        }
    },

    save: function(guildId, newData) {
        try {
            if (!guildId) return false;
            const id = String(guildId); // Force ID to be a string

            const rawData = fs.readFileSync(dbPath, 'utf8');
            const allData = JSON.parse(rawData || '{}');

            // Merge new data into the specific server ID
            allData[id] = { ...(allData[id] || {}), ...newData };

            fs.writeFileSync(dbPath, JSON.stringify(allData, null, 2));
            return true;
        } catch (err) {
            console.error(`[CONSOLE] Save Error: ${err.message}`);
            return false;
        }
    }
};
