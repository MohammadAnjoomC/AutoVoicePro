const { Client, GatewayIntentBits, Collection, Events, ChannelType, REST, Routes, ActivityType } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, prefix, clientId } = require('./config.json');
const db = require('./database/db');

// Custom Logger function
const log = (message) => console.log(`[CONSOLE] ${message}`);

/**
 * 1. INITIALIZE CLIENT
 */
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildVoiceStates 
    ] 
});

/**
 * 2. LOAD COMMANDS & PREPARE DEPLOYMENT
 */
client.commands = new Collection();
const commandsJSON = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        const name = command.data?.name || command.name;
        if (name) {
            client.commands.set(name, command);
        }

        if ('data' in command && 'execute' in command) {
            commandsJSON.push(command.data.toJSON());
        }
    }
}

/**
 * 3. AUTO-DEPLOYMENT FUNCTION (GLOBAL)
 */
const autoDeploy = async () => {
    const rest = new REST().setToken(token);
    try {
        log(`Refreshing ${commandsJSON.length} global (/) commands...`);
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commandsJSON },
        );
        log('Successfully reloaded application (/) commands globally.');
    } catch (error) {
        log(`Slash command deployment failed: ${error.message}`);
    }
};

/**
 * 4. EVENT: BOT READY & STATUS
 */
client.once(Events.ClientReady, async c => {
    log(`Logged in as ${c.user.tag}`);
    
    // Set Bot Activity Status
    client.user.setActivity({
        name: 'Join to Create! | !help',
        type: ActivityType.Watching // Watching, Playing, Listening, Competing
    });
    
    log(`Activity status set to: Watching Join to Create!`);
    await autoDeploy(); 
});

/**
 * 5. HANDLE SLASH COMMANDS
 */
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
        log(`User ${interaction.user.tag} used /${interaction.commandName} in ${interaction.guild.name}`);
    } catch (error) {
        log(`Error executing /${interaction.commandName}: ${error.message}`);
        const errorMessage = { content: 'Error executing slash command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

/**
 * 6. HANDLE PREFIX COMMANDS
 */
client.on(Events.MessageCreate, async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args);
        log(`User ${message.author.tag} used ${prefix}${commandName} in ${message.guild.name}`);
    } catch (error) {
        log(`Error executing ${prefix}${commandName}: ${error.message}`);
        message.reply('There was an error executing that command.');
    }
});

/**
 * 7. MULTI-SERVER JOIN-TO-CREATE LOGIC
 */
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const guild = newState.guild;
    if (!guild || !newState.channelId) return;

    const data = db.load(guild.id);
    if (!data.triggerId || !data.categoryId) return;

    if (newState.channelId === data.triggerId) {
        const member = newState.member;
        if (!member) return;

        try {
            const newChannel = await guild.channels.create({
                name: `🔊 ${member.displayName}`,
                type: ChannelType.GuildVoice,
                parent: data.categoryId,
            });

            log(`New Voice Channel created for ${member.user.tag} in ${guild.name}`);

            await newChannel.lockPermissions().catch(() => null);
            await newChannel.permissionOverwrites.edit(member.id, {
                ManageChannels: true,
                Connect: true,
                Speak: true,
                MoveMembers: true
            }).catch(() => null);

            await member.voice.setChannel(newChannel).catch(async () => {
                if (newChannel) await newChannel.delete().catch(() => null);
            });

            const checkEmpty = setInterval(async () => {
                try {
                    const fetchedChannel = await guild.channels.fetch(newChannel.id).catch(() => null);
                    if (!fetchedChannel || fetchedChannel.members.size === 0) {
                        if (fetchedChannel) {
                            await fetchedChannel.delete().catch(() => null);
                            log(`Empty channel ${newChannel.id} deleted in ${guild.name}`);
                        }
                        clearInterval(checkEmpty);
                    }
                } catch (e) {
                    clearInterval(checkEmpty);
                }
            }, 5000);

        } catch (err) {
            log(`[Server: ${guild.id}] Join-to-Create Error: ${err.message}`);
        }
    }
});

/**
 * 8. ERROR HANDLING & LOGIN
 */
process.on('unhandledRejection', error => {
    log(`Unhandled promise rejection: ${error}`);
});

client.login(token);
