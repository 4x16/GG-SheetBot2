const {SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const {editMemberValue, getClanData} = require('/opt/GG-SheetBot2/src/events/database.js');
const role_list = ['1349834015116496946', '1349834218041245726', '1349835516861743136', '1364901683532136478'];
const rni_role_id = 'YOUR_RNI_ROLE_ID'; // Replace with the actual RNI role ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subreg')
        .setDescription("Adjust a trooper's subregiment")
        .setDMPermission(false)
        .addStringOption((option) => option.setName('name').setDescription('Name of the trooper').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('role')
                .setDescription('Trooper role')
                .addChoices(
                    {name: 'Core', value: 'Core'},
                    {name: 'Engineer', value: 'Engineer'},
                    {name: 'Pilot', value: 'Pilot'},
                    {name: 'Medic', value: 'Medic'},
                    {name: 'RNI', value: 'RNI'},
                    {name: 'Engineer OIC', value: 'Engineer OIC'},
                    {name: 'Pilot OIC', value: 'Pilot OIC'},
                    {name: 'Medic OIC', value: 'Medic OIC'},
                    {name: 'RNI OIC', value: 'RNI OIC'},
                    {name: '2IC', value: '2IC'},
                    {name: 'Commander', value: 'Commander'}
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        const roleCheck = interaction.guild.roles.cache.find(role => role.name === 'NCO');

        const ranklist = [
            '01 Naval Trainee',
            '02 Crewman',
            '03 Able Crewman',
            '04 Leading Crewman',
            '05 Petty Officer',
            '06 Chief Petty Officer',
            '07 Senior Chief',
            '08 Master Chief',
            '09 Sub Officer',
            '10 Warrant Officer',
            '11 Midshipman',
            '12 Ensign',
            '13 Sub Lieutenant',
            '14 Lieutenant',
            '15 Senior Lieutenant',
            '16 Deck Officer',
            '17 Lieutenant Commander',
            '18 Commander',
            '19 Captain',
            '20 Commodore',
        ];
        const engranklist = [
            '01 Technical Associate',
            '02 Junior Technician',
            '03 Technician',
            '04 Senior Technician',
            '05 Associate Engineer',
            '06 Engineer',
            '07 Senior Engineer',
            '08 Chief Engineer',
            '09 Principle Engineer',
            '10 Technical Officer',
            '11 Foreman',
            '12 Senior Foreman',
            '13 Systems Coordinator',
            '14 Site Manager',
            '15 Project Lead',
            '16 Zone Manager',
            '17 Division Lead',
            '18 Director',
        ];
        const pilotranklist = [
            '01 Flight Cadet',
            '02 Airman',
            '03 Airman First Class',
            '04 Senior Airman',
            '05 Sergeant',
            '06 Flight Sergeant',
            '07 Master Sergeant',
            '08 Chief Master Sergeant',
            '09 Sergeant Major',
            '10 Warrant Officer',
            '11 Midshipman',
            '12 Flight Officer',
            '13 Flight Lieutenant',
            '14 Strike Leader',
            '15 Squadron Leader',
            '16 Wing Leader',
            '17 Wing Commander',
            '18 Group Captain',
        ]
        const rniranklist = [
            '05 Junior Operative',
            '06 Operative',
            '07 Senior Operative',
            '08 Lead Operative',
            '09 Junior Agent',
            '10 Agent',
            '11 Special Agent',
            '12 Assistant Inspector',
            '13 Inspector',
            '14 Inspector General',
            '15 Superintendent',
            '16 Chief Superintendent',
            '17 Deputy Director',
            '18 Director',
        ]

        if (interaction.member.roles.cache.has(roleCheck.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const name = interaction.options.getString('name');
            const newRole = interaction.options.getString('role');

            // Get current data from sheet
            const currentData = await getClanData(name)

            if (currentData.length === 0) {
                await interaction.reply({content: '<:SheetMoment:1136068085682552832> Error: Trooper not found.'});
                return;
            }

            const currentRank = currentData.rank;
            const rankNumber = currentRank.substring(0, 2);
            const did = currentData.did

            // Determine new rank based on role
            let newRank = currentRank;
            if (newRole === 'Engineer' || newRole === 'Engineer OIC') {
                newRank = engranklist.find(rank => rank.startsWith(rankNumber));
                // for (const role of role_list) {
                //     interaction.guild.members.cache.get(did).roles.remove(role);
                // }
                // interaction.guild.members.cache.get(did).roles.add('1349834015116496946');
            } else if (newRole === 'Pilot' || newRole === 'Pilot OIC') {
                newRank = pilotranklist.find(rank => rank.startsWith(rankNumber));
                // for (const role of role_list) {
                //     interaction.guild.members.cache.get(did).roles.remove(role);
                // }
                // interaction.guild.members.cache.get(did).roles.add('1349834218041245726');
            } else if (newRole === 'Medic' || newRole === 'Medic OIC') {
                newRank = ranklist.find(rank => rank.startsWith(rankNumber));
                // for (const role of role_list) {
                //     interaction.guild.members.cache.get(did).roles.remove(role);
                // }
                // interaction.guild.members.cache.get(did).roles.add('1349835516861743136');
            } else if (newRole === 'RNI' || newRole === 'RNI OIC') {
                newRank = rniranklist.find(rank => rank.startsWith(rankNumber));
                // for (const role of role_list) {
                //     interaction.guild.members.cache.get(did).roles.remove(role);
                // }
                // interaction.guild.members.cache.get(did).roles.add('1364901683532136478');
            } else {
                newRank = ranklist.find(rank => rank.startsWith(rankNumber));
                // for (const role of role_list) {
                //     interaction.guild.members.cache.get(did).roles.remove(role);
                // }
                // interaction.guild.members.cache.get(did).roles.add('1364902403182428180');
            }

            await interaction.reply({content: '<:SheetMoment:1136068085682552832> Successfully updated: **' + name + '** to role: **' + newRole + '** with rank: **' + newRank + '**'});

            // store.edit('[API] Roster', {
            //     search: {Name: name},
            //     set: {
            //         Role: newRole,
            //         Rank: newRank
            //     },
            // });

            editMemberValue(name, "role", newRole);
            editMemberValue(name, "rank", newRank);

        } else {
            await interaction.reply({content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.'});
        }
    },
};