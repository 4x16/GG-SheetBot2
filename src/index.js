const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, ActivityType } = require(`discord.js`);
const fs = require('fs');
const path = require('path');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

client.commands = new Collection();

require('dotenv').config();

client.once('ready', () => {
  client.user.setPresence({
    activities: [{ name: `Garry's Mod`, type: ActivityType.Playing }],
    status: 'online',
  });
  // Remove this line
  // require('./events/licenseCheck.js').execute(client);
  console.log('Ready!');
});

const functions = fs.readdirSync('./src/functions').filter((file) => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./src/commands');

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  // Remove this line
  // client.handleEvents(eventFiles, './src/events');
  
  // Keep the manual event registration
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
      } else {
          client.on(event.name, (...args) => event.execute(...args));
      }
  }
  client.handleCommands(commandFolders, './src/commands');
  client.login(process.env.token);
})();
