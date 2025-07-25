const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { editMemberValue } = require('/opt/GG-SheetBot2/src/events/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription("Update a trooper's information.")
        .setDMPermission(false)
        .addStringOption((option) => option.setName('name').setDescription('The trooper you wish to update').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('field')
                .setDescription('The field you wish to update')
                .addChoices(
                    { name: 'Name', value: 'name' },
                    { name: 'Rank', value: 'rank' },
                    { name: 'Role', value: 'role' },
                    { name: 'User', value: 'user' },
                    { name: 'Alias', value: 'alias' }
                )
                .setRequired(true)
        )
        .addStringOption((option) => option.setName('data').setDescription('The data inserted into the field').setRequired(true)),
    async execute(interaction) {
        try {
            // Defer the reply to give us more time to process
            await interaction.deferReply();

            // Check permissions
            const role = interaction.guild.roles.cache.find(role => role.name === 'Officer');
            const hasPermission = interaction.member.roles.cache.has(role?.id) ||
                interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

            if (!hasPermission) {
                return await interaction.editReply({
                    content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command!'
                });
            }

            // Get command options
            const field = interaction.options.getString('field');
            const data = interaction.options.getString('data');
            const name = interaction.options.getString('name');

            await interaction.editReply({
                content: `<:SheetMoment:1136068085682552832> Successfully changed field: **${field}** to: **${data}**`
            });

            // Use the new editMemberValue function
            const success = await editMemberValue(name, field, data);

            if (!success) {
                return await interaction.editReply({
                    content: `<:SheetMoment:1136068085682552832> Error: User "${name}" not found in the database.`
                });
            }

            // Log the update
            const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Australia/Melbourne' });
            const logMessage = `\n[${timestamp}][${interaction.user.tag}] used /update and set ${name}'s ${field} to: ${data}.`;

            // Reply to the user

        } catch (error) {
            console.error('Update command error:', error);
            // If we haven't replied yet, use reply, otherwise use editReply
            const replyMethod = interaction.deferred ? interaction.editReply : interaction.reply;
            await replyMethod.call(interaction, {
                content: `<:SheetMoment:1136068085682552832> Error: ${error.message}`,
                ephemeral: true
            });
        }
    },
};