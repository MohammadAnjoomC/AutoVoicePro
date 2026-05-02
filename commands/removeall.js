const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeall')
        .setDescription('Wipe your server voice settings from the database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    name: 'removeall',

    async execute(messageOrInteraction) {
        try {
            // 1. Get the current Server ID
            const guildId = messageOrInteraction.guild.id;

            // 2. Clear only this server's data by passing an empty object
            db.save(guildId, { triggerId: null, categoryId: null });

            const successMsg = "🗑️ **Settings Cleared:** Voice trigger and category settings for this server have been removed.";

            if (messageOrInteraction.isChatInputCommand?.()) {
                await messageOrInteraction.reply({ content: successMsg });
            } else {
                await messageOrInteraction.reply(successMsg);
            }
        } catch (error) {
            console.error("Error clearing database:", error);
            const errorMsg = "⚠️ An error occurred while trying to clear the settings.";
            
            if (messageOrInteraction.isChatInputCommand?.()) {
                await messageOrInteraction.reply({ content: errorMsg, ephemeral: true });
            } else {
                await messageOrInteraction.reply(errorMsg);
            }
        }
    },
};
