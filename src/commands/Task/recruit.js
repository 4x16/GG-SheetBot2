const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { addClanMember } = require('/opt/GG-SheetBot2/src/events/database.js');
const role_list = ['1349722166245068921'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recruit')
        .setDescription('Add a trooper to the sheet.')
        .setDMPermission(false)
        .addStringOption((option) => option.setName('name').setDescription('Name').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('rank')
                .setDescription('Trooper rank')
                .addChoices(
                    { name: 'Naval Trainee', value: '01 Naval Trainee' },
                    { name: 'Crewman', value: '02 Crewman' },
                    { name: 'Able Crewman', value: '03 Able Crewman' },
                    { name: 'Leading Crewman', value: '04 Leading Crewman' },
                    { name: 'Petty Officer', value: '05 Petty Officer' },
                    { name: 'Chief Petty Officer', value: '06 Chief Petty Officer' },
                    { name: 'Senior Chief', value: '07 Senior Chief' },
                    { name: 'Master Chief', value: '08 Master Chief' },
                    { name: 'Sub Officer', value: '09 Sub Officer' },
                    { name: 'Warrant Officer', value: '10 Warrant Officer' },
                    { name: 'Midshipman', value: '11 Midshipman' },
                    { name: 'Ensign', value: '12 Ensign' },
                    { name: 'Sub Lieutenant', value: '13 Sub Lieutenant' },
                    { name: 'Lieutenant', value: '14 Lieutenant' },
                    { name: 'Senior Lieutenant', value: '15 Senior Lieutenant' },
                    { name: 'Deck Officer', value: '16 Deck Officer' },
                    { name: 'Lt Commander', value: '17 Lt Commander' },
                    { name: 'Commander', value: '18 Commander' },
                    { name: 'Captain', value: '19 Captain' },
                    { name: 'Commodore', value: '20 Commodore' }
                )
                .setRequired(true)
        )
        .addUserOption((option) => option.setName('user').setDescription('Discord @').setRequired(true).setRequired(true))
        .addStringOption((option) => option.setName('alias').setDescription('Preffered alias').setRequired(true))
        .addStringOption((option) => option.setName('recruiter').setDescription("Recruiting trooper's name").setRequired(true)),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'NCO');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const name = interaction.options.getString('name');
            const rank = interaction.options.getString('rank');
            const role = "Core"
            const alias = interaction.options.getString('alias');
            const recruiter = interaction.options.getString('recruiter');
            let recruitmentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            let user = interaction.options.getUser('user');
            const userr = interaction.options.getUser('user');
            user = user.username;

            for (const role of role_list) {
                interaction.guild.members.cache.get(userr.id).roles.add(role);
            }

            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> Successfully added: **' + name + '** at rank: **' + rank + '**' });
            await addClanMember(name, rank, role, user, userr.id, alias, recruiter, recruitmentDate, recruitmentDate, 0, "TBD", "TBD")

        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }},
};
