const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { editMemberValue, getClanData } = require('/opt/GG-SheetBot2/src/events/database.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a trooper from the sheet.')
        .setDMPermission(false)
        .addStringOption((option) => option.setName('name').setDescription('Name').setRequired(true)),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'Officer');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            let name = interaction.options.getString('name');
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
            ];
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

            let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            let currentrank = '???';
            const rosterData = await getClanData(name)
            console.log(rosterData)

            if (!rosterData || rosterData.length === 0) {
                await interaction.reply({ content: '<:SheetMoment:1136068085682552832> Error: Trooper **' + name + '** not found!' });
                return;
            }

            currentrank = rosterData.rank;
            console.log(currentrank);
            currentrole = rosterData.role;
            join_date = rosterData.joindate;
            User = rosterData.user;
            Did = rosterData.did;
            alias = rosterData.alias;
            recruiter = rosterData.recruiter;
            function get_next_rank(rank, role) {
                let rankList;

                // Determine which rank list to use based on role
                if (role === 'Engineer' || role === 'Engineer OIC') {
                    rankList = engranklist;
                } else if (role === 'Pilot' || role === 'Pilot OIC') {
                    rankList = pilotranklist;
                } else if (role == 'RNI' || role === 'RNI OIC') {
                    rankList = rniranklist;
                } else {
                    rankList = ranklist;
                }

                // Find the index of the rank in the appropriate list
                const index = rankList.indexOf(rank);

                // If the index is not found, return null
                if (index === -1) {
                    return null;
                }

                // Return the rank one up the list
                return rankList[index + 1];
            }

            const next_rank = get_next_rank(currentrank, currentrole);

            // Modify the max rank check to consider different roles
            const isMaxRank = (currentrole === 'Engineer' || currentrole === 'Engineer OIC') ?
                currentrank === '18 Director' :
                (currentrole === 'Pilot' || currentrole === 'Pilot OIC') ?
                    currentrank === '18 Group Captain' :
                    (currentrole === 'RNI' || currentrole === 'RNI OIC') ?
                        currentrank === '18 Director' :
                        currentrank === '20 Commodore';

            if (!isMaxRank && next_rank) {
                // store.edit('[API] Roster', {
                //     search: { Name: name },
                //     set: { Rank: next_rank, TaskCount: 0, 'Promo Date': currentDate },
                // });
                editMemberValue(name, "rank", next_rank);
                editMemberValue(name, "taskcount", 0);
                editMemberValue(name, "promodate", currentDate);

                // Keep the role assignments as they were for the standard ranks
                if (next_rank === '06 Chief Petty Officer' || next_rank === '06 Engineer' || next_rank === '06 Flight Sergeant') {
                    interaction.guild.members.cache.get(Did).roles.add('1349721704590737469');
                }
                if (next_rank === '11 Midshipman' || next_rank === '11 Foreman' || next_rank === '11 Special Agent' || next_rank === '11 Officer Cadet') {
                    interaction.guild.members.cache.get(Did).roles.add('1349721679672381504');
                }
                if (next_rank === '15 Senior Lieutenant' || next_rank === '15 Project Lead' || next_rank === '15 Squadron Leader' || next_rank === '15 Superintendent') {
                    interaction.guild.members.cache.get(Did).roles.add('1349721519118356542');
                }

                await interaction.reply({ content: '<:SheetMoment:1136068085682552832> Successfully promoted: **' + name + '** to rank: **' + next_rank + '**' });
            } else {
                await interaction.reply({ content: '<:SheetMoment:1136068085682552832>**' + name + '** is already max rank!' })
            }
        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }},
};
