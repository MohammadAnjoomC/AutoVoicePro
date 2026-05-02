const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // 1. Slash Command Configuration
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and responsiveness'),

    // 2. Prefix Command Name
    name: 'ping',

    // 3. Execution Logic
    async execute(messageOrInteraction) {
        // Calculate the round-trip latency
        const sent = await messageOrInteraction.reply({ content: '🏓 Pinging...', fetchReply: true });
        const timeDiff = sent.createdTimestamp - messageOrInteraction.createdTimestamp;
        const apiPing = Math.round(messageOrInteraction.client.ws.ping);

        const response = `🏓 **Pong!**\n**Roundtrip Latency:** \`${timeDiff}ms\`\n**WebSocket Heartbeat:** \`${apiPing}ms\``;

        // Edit the initial reply with the results
        if (messageOrInteraction.isChatInputCommand?.()) {
            await messageOrInteraction.editReply(response);
        } else {
            await sent.edit(response);
        }
    },
};
