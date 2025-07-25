const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const roleId = '1351357808506834964';
            await member.roles.add(roleId);
        } catch (error) {
            console.error(`Error adding role to new member: ${error}`);
        }
    },
};