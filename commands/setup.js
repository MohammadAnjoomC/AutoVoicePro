const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Show current Join-to-Create configuration')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    name: 'setup',
    async execute(messageOrInteraction) {
        // 1. Get the current Server ID
        const guildId = messageOrInteraction.guild.id;

        // Permission Check for Prefix
        if (!messageOrInteraction.isChatInputCommand?.()) {
            if (!messageOrInteraction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return messageOrInteraction.reply("❌ Admins only!");
            }
        }

        // 2. Load settings specifically for this server
        const data = db.load(guildId);
        
        const trigger = data.triggerId ? `<#${data.triggerId}>` : "❌ Not Set";
        const category = data.categoryId ? `\`${data.categoryId}\`` : "❌ Not Set";

        const embed = new EmbedBuilder()
            .setColor(0x00FF7F)
            .setTitle('⚙️ AutoVoicePro Configuration')
            .addFields(
                { name: 'Triger Channel', value: trigger, inline: true },
                { name: 'Target Category', value: category, inline: true },
                { name: 'System Status', value: (data.triggerId && data.categoryId) ? "🟢 Active" : "🔴 Incomplete", inline: false }
            )
            .setFooter({ text: 'Use /voicetrigger and /voicecategory to update' });

        await messageOrInteraction.reply({ embeds: [embed] });
    },
};
