const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglerename')
        .setDescription('Enable or disable the rename command for users')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    name: 'togglerename',
    async execute(messageOrInteraction) {
        // 1. Get the Guild ID (Server ID)
        const guildId = messageOrInteraction.guild.id; 

        if (!messageOrInteraction.isChatInputCommand?.()) {
            if (!messageOrInteraction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return messageOrInteraction.reply("❌ Admins only!");
            }
        }

        // 2. Pass the guildId to load specific server settings
        const settings = db.load(guildId); 
        
        // Toggle the value
        settings.renameEnabled = !settings.renameEnabled;

        // 3. Pass the guildId to save specifically for this server
        db.save(guildId, settings); 

        const status = settings.renameEnabled ? "🟢 Enabled" : "🔴 Disabled";
        const embed = new EmbedBuilder()
            .setColor(settings.renameEnabled ? 0x00FF7F : 0xFF0000)
            .setTitle('System Update')
            .setDescription(`The \`!rename\` command is now **${status}** for all members.`)
            .setTimestamp();

        await messageOrInteraction.reply({ embeds: [embed] });
    },
};
