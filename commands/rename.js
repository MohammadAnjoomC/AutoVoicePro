const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Rename your temporary voice channel')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The new name for your room')
                .setRequired(true)),

    name: 'rename',

    async execute(messageOrInteraction, args) {
        // 1. Get the current Server ID
        const guildId = messageOrInteraction.guild.id; 
        
        // 2. Load settings specifically for this server
        const settings = db.load(guildId); 
        
        const member = messageOrInteraction.member;
        const voiceChannel = member.voice.channel;
        
        const isSlash = messageOrInteraction.isChatInputCommand?.();
        const newName = isSlash ? messageOrInteraction.options.getString('name') : args.join(' ');

        // --- 🔒 SAFETY CHECKS ---

        // 1. Check if the Rename Feature is enabled for THIS server
        if (!settings.renameEnabled) {
            return messageOrInteraction.reply({ 
                content: "❌ The rename feature is currently **disabled** by a Server Administrator.", 
                ephemeral: true 
            });
        }

        // 2. Check if user is in a voice channel
        if (!voiceChannel) {
            return messageOrInteraction.reply({ 
                content: "❌ You must be connected to your voice channel to rename it.", 
                ephemeral: true 
            });
        }

        // 3. Check if it's a temporary channel (Must be in the server's set Category)
        if (voiceChannel.parentId !== settings.categoryId) {
            return messageOrInteraction.reply({ 
                content: "❌ You can only rename temporary rooms created by the bot.", 
                ephemeral: true 
            });
        }

        // 4. Check Ownership
        const hasLocalPerms = voiceChannel.permissionOverwrites.cache.has(member.id);
        if (!hasLocalPerms && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return messageOrInteraction.reply({ 
                content: "❌ You don't own this channel! You can only rename rooms you created.", 
                ephemeral: true 
            });
        }

        if (!newName) {
            return messageOrInteraction.reply({ 
                content: "❌ Please provide a name. Usage: `!rename My Awesome Room`", 
                ephemeral: true 
            });
        }

        try {
            await voiceChannel.setName(newName);

            const successEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('✏️ Channel Renamed')
                .setDescription(`Your voice channel has been updated to: **${newName}**`)
                .setFooter({ text: 'Note: Discord limits renames to 2 times every 10 minutes.' })
                .setTimestamp();

            await messageOrInteraction.reply({ embeds: [successEmbed] });

        } catch (error) {
            if (error.status === 429) {
                return messageOrInteraction.reply({ 
                    content: "⚠️ **Rate Limit:** Discord only allows 2 name changes every 10 minutes. Please wait before trying again.", 
                    ephemeral: true 
                });
            }

            console.error(error);
            messageOrInteraction.reply({ content: "⚠️ Failed to rename the channel. Please check my permissions.", ephemeral: true });
        }
    },
};
