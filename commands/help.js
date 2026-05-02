const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('The ultimate guide to AutoVoicePro'),
    name: 'help',
    async execute(messageOrInteraction) {
        const client = messageOrInteraction.client;
        
        // Calculate Uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;

        // --- 1. THE MAIN HOME EMBED ---
        const homeEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🛡️ AutoVoicePro | Main Menu')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(
                `Welcome to the management system for your server's voice activities.\n\n` +
                `**Bot Statistics:**\n` +
                `📡 **Servers:** ${client.guilds.cache.size}\n` +
                `⏳ **Uptime:** ${days}d ${hours}h ${minutes}m\n\n` +
                `*Use the select menu below to view specific command categories.*`
            )
            .setFooter({ text: 'Interactive Help System • AutoVoicePro' })
            .setTimestamp();

        // --- 2. THE SELECT MENU ---
        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('Select a Category')
                    .addOptions([
                        {
                            label: 'General',
                            description: 'Basic commands and bot status.',
                            value: 'general',
                            emoji: '🌐',
                        },
                        {
                            label: 'Setup & Admin',
                            description: 'Commands for configuring the system.',
                            value: 'setup',
                            emoji: '⚙️',
                        },
                        {
                            label: 'Member Features',
                            description: 'Commands for temporary room owners.',
                            value: 'member',
                            emoji: '👤',
                        },
                        {
                            label: 'Developer Info',
                            description: 'Information about the creator.',
                            value: 'dev',
                            emoji: '👨‍💻',
                        },
                    ]),
            );

        // --- 3. THE BUTTONS (Invite & GitHub) ---
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Bot')
                    .setURL('https://discord.com/api/oauth2/authorize?client_id=1500055955403178035&permissions=8&scope=bot%20applications.commands')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('GitHub')
                    .setURL('https://github.com/MohammadAnjoomC')
                    .setStyle(ButtonStyle.Link)
            );

        // --- 4. SENDING THE INITIAL RESPONSE ---
        const response = await messageOrInteraction.reply({ 
            embeds: [homeEmbed], 
            components: [menu, buttons],
            fetchReply: true 
        });

        // --- 5. INTERACTION COLLECTOR ---
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            const userId = messageOrInteraction.user?.id || messageOrInteraction.author?.id;
            if (i.user.id !== userId) {
                return i.reply({ content: "Please run your own !help command.", ephemeral: true });
            }

            const selection = i.values[0];
            const newEmbed = new EmbedBuilder().setTimestamp().setThumbnail(client.user.displayAvatarURL());

            if (selection === 'general') {
                newEmbed.setTitle('🌐 General Commands')
                    .setColor(0x00FF7F)
                    .addFields(
                        { name: '`!ping`', value: 'Check bot latency and API response time.' },
                        { name: '`!help`', value: 'Opens this interactive menu.' }
                    );
            } else if (selection === 'setup') {
                newEmbed.setTitle('⚙️ Setup Commands (Admins Only)')
                    .setColor(0xFFA500)
                    .addFields(
                        { name: '`!voicetrigger [ID]`', value: 'Sets the channel that users join to create a room.' },
                        { name: '`!voicecategory [ID]`', value: 'Sets the category where new rooms appear.' },
                        { name: '`!setup`', value: 'Shows current configuration IDs.' },
                        { name: '`!togglerename`', value: 'Enable or Disable the rename command for members.' },
                        { name: '`!removeall`', value: 'Wipes all database settings.' }
                    );
            } else if (selection === 'member') {
                newEmbed.setTitle('👤 Member Features')
                    .setColor(0x3498DB)
                    .addFields(
                        { name: '`!rename [Name]`', value: 'Change your temporary room name (Room Owners only).' }
                    );
            } else if (selection === 'dev') {
                newEmbed.setTitle('👨‍💻 Developer Information')
                    .setColor(0x000000)
                    .setDescription(
                        `**Developer:** Mohammad Anjoom C (Anju)\n` +
                        `**Role:** Full-stack Developer\n` +
                        `**GitHub:** [MohammadAnjoomC](https://github.com/MohammadAnjoomC)\n\n` +
                        `Developed using Discord.js v14.`
                    );
            }

            await i.update({ embeds: [newEmbed] });
        });

        collector.on('end', () => {
            const disabledMenu = new ActionRowBuilder().addComponents(menu.components[0].setDisabled(true));
            response.edit({ components: [disabledMenu] }).catch(() => null);
        });
    },
};
