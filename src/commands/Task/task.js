const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { addTask } = require('/opt/GG-SheetBot2/src/events/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Log a new task.')
        .setDMPermission(false)
        .addStringOption((option) => option.setName('type').setDescription('The type of task i.e. "Event lead"').setRequired(true))
        .addStringOption((option) =>
            option.setName('description')
                .setDescription('A general description of the task (max 80 characters)')
                .setRequired(true)
                .setMaxLength(80) // This is the key line!
        ),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'NCO');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            let task = interaction.options.getString('type');
            let description = interaction.options.getString('description');
            const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
            let nickName = interactionUser.nickName;
            if (nickName == null) {
                nickName = interactionUser.displayName;
            }
            let did = interaction.user.id;

            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> Successfully added task: **' + task + '** to the sheet. An officer will approve it soon.' });

            addTask(task, description, nickName, did);

        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }
    },
};