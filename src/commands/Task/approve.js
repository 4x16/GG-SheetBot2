const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { delTask, editMemberValueId, retreiveDidTask, getClanDataDid} = require('/opt/GG-SheetBot2/src/events/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approve')
        .setDescription('Approve a task.')
        .setDMPermission(false)
        .addStringOption((option) => option.setName('id').setDescription('The ID of the task you wish to approve.').setRequired(true)),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'Officer');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            let taskid = interaction.options.getString('id');

            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> Successfully verified task: **' + taskid + '.**' });

            // store.append('[API] Task', [
            //     {
            //         TaskID: Math.floor(Math.random() * (999 - 100 + 1) + 100),
            //         Task: task,
            //         Description: description,
            //         Image: image,
            //         Did: nickName,
            //         TDid: interaction.user.id,
            //     },
            // ]);

            const did = await retreiveDidTask(taskid);
            const clanData = await getClanDataDid(did)
            const taskcount = clanData.taskcount
            editMemberValueId(did, 'taskcount', taskcount+1)
            delTask(taskid)

        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }},
};
