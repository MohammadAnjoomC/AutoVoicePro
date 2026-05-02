const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicecategory')
        .setDescription('Set the category where new voice channels will be created')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('The ID of the Category')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    name: 'voicecategory',

    async execute(messageOrInteraction, args) {
        // 1. Get the current Server ID
        const guildId = messageOrInteraction.guild.id;

        if (!messageOrInteraction.isChatInputCommand?.()) {
            if (!messageOrInteraction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const noPermEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🚫 Access Denied')
                    .setDescription('You do not have the **Manage Channels** permission required.');
                
                return messageOrInteraction.reply({ embeds: [noPermEmbed] });
            }
        }

        const isSlash = messageOrInteraction.isChatInputCommand?.();
        const categoryId = isSlash ? messageOrInteraction.options.getString('id') : args[0];

        if (!categoryId) {
            return messageOrInteraction.reply({ content: "❌ Please provide a valid Category ID.", ephemeral: true });
        }

        const guild = messageOrInteraction.guild;
        const category = guild.channels.cache.get(categoryId);

        // Verify if ID is a Category (Type 4)
        if (!category || category.type !== 4) { 
            return messageOrInteraction.reply({ content: "❌ Invalid ID! Please ensure it is a **Category** ID.", ephemeral: true });
        }

        const botPerms = category.permissionsFor(guild.members.me);
        const required = [
            { flag: PermissionFlagsBits.ViewChannel, name: 'View Channel' },
            { flag: PermissionFlagsBits.ManageChannels, name: 'Manage Channels' },
            { flag: PermissionFlagsBits.MoveMembers, name: 'Move Members' },
            { flag: PermissionFlagsBits.Connect, name: 'Connect' }
        ];

        const missing = required.filter(p => !botPerms.has(p.flag));

        if (missing.length > 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('⚠️ Missing Category Permissions')
                .setDescription(`I am missing: \`${missing.map(p => p.name).join(', ')}\``);

            return messageOrInteraction.reply({ embeds: [errorEmbed] });
        }

        // --- 💾 DATABASE UPDATE WITH GUILD ID ---
        const settings = db.load(guildId); // Pass guildId to load
        const oldId = settings.categoryId || "Not Set";
        
        // Update only this server's categoryId
        db.save(guildId, { categoryId: categoryId }); 

        const successEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📂 Category Linked Successfully')
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Category Name', value: `**${category.name}**`, inline: true },
                { name: 'Status', value: '🟢 Active', inline: true },
                { name: 'Previous ID', value: `\`${oldId}\``, inline: false },
                { name: 'New ID', value: `\`${categoryId}\``, inline: false }
            )
            .setTimestamp();

        await messageOrInteraction.reply({ embeds: [successEmbed] });
    },
};
