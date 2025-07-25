const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleCommands = async (commandFolders, commandsPath) => {
        client.commandArray = [];
        for (const folder of commandFolders) {
            const folderPath = path.resolve(process.cwd(), commandsPath, folder);
            const commandFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.resolve(folderPath, file);
                const command = require(filePath);

                // Skip disabled commands
                if (command.disabled) continue;

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                }
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.token);

        try {
            if (!process.env.clientId) {
                throw new Error('Client ID is not defined in environment variables');
            }

            console.log('Started refreshing application (/) commands.');
            await rest.put(Routes.applicationCommands(process.env.clientId), {
                body: client.commandArray,
            });
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error refreshing commands:', error);
        }
    };
};
