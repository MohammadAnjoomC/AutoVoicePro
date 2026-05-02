const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicetrigger')
        .setDescription('Set the voice channel that triggers room creation')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('The ID of the Voice Channel')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    name: 'voicetrigger',

    async execute(messageOrInteraction, args) {
        // 1. Get the current Server ID
        const guildId = messageOrInteraction.guild.id;

        // --- 🔒 USER PERMISSION CHECK (For Prefix Commands) ---
        if (!messageOrInteraction.isChatInputCommand?.()) {
            if (!messageOrInteraction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const noPermEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🚫 Access Denied')
                    .setDescription('You do not have the `Manage Channels` permission required to use this command.');
                
                return messageOrInteraction.reply({ embeds: [noPermEmbed] });
            }
        }

        const isSlash = messageOrInteraction.isChatInputCommand?.();
        const channelId = isSlash ? messageOrInteraction.options.getString('id') : args[0];

        if (!channelId) {
            return messageOrInteraction.reply({ content: "❌ Please provide a valid Voice Channel ID.", ephemeral: true });
        }

        const guild = messageOrInteraction.guild;
        const channel = guild.channels.cache.get(channelId);

        // --- 🛠️ BOT PERMISSION & TYPE CHECK ---
        if (!channel || channel.type !== 2) { 
            return messageOrInteraction.reply({ content: "❌ Invalid ID! Please ensure it is a **Voice Channel** ID.", ephemeral: true });
        }

        const botPerms = channel.permissionsFor(guild.members.me);
        const required = [
            { flag: PermissionFlagsBits.ViewChannel, name: 'View Channel' },
            { flag: PermissionFlagsBits.Connect, name: 'Connect' },
            { flag: PermissionFlagsBits.MoveMembers, name: 'Move Members' }
        ];

        const missing = required.filter(p => !botPerms.has(p.flag));

        if (missing.length > 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('⚠️ Bot Permission Error')
                .setDescription(`I am missing permissions in that channel: \`${missing.map(p => p.name).join(', ')}\``);

            return messageOrInteraction.reply({ embeds: [errorEmbed] });
        }

        // --- 💾 DATABASE UPDATE WITH GUILD ID ---
        const settings = db.load(guildId); // Load server-specific settings
        const oldId = settings.triggerId || "Not Set";
        
        // Save using the server ID to prevent [object Object] error
        db.save(guildId, { triggerId: channelId });

        // --- ✨ MODERN SUCCESS RESPONSE ---
        const successEmbed = new EmbedBuilder()
            .setColor(0x00FF7F)
            .setTitle('✅ Trigger Channel Linked')
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Linked Channel', value: `<#${channelId}>`, inline: true },
                { name: 'Channel Type', value: `Voice Channel`, inline: true },
                { name: 'Previous ID', value: `\`${oldId}\``, inline: false },
                { name: 'Current ID', value: `\`${channelId}\``, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'AutoVoicePro Setup' });

        await messageOrInteraction.reply({ embeds: [successEmbed] });
    },
};
