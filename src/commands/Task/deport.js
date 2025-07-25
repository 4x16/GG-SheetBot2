const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { removeClanMember } = require('/opt/GG-SheetBot2/src/events/database.js');
const {getClanData} = require("../../events/database");

const role_removal_list = ['1349721438659154010', '1349721488177234055', '1349721519118356542', '1349721679672381504', '1349721704590737469', '1349722166245068921', '1355163352028025003', '1349834015116496946', '1349834218041245726', '1349835516861743136', '1364901683532136478', '1364902403182428180'];
module.exports = {
    data: new SlashCommandBuilder()
        .setName('deport')
        .setDescription('Send a trooper back to Kamino.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
        .addStringOption((option) => option.setName('name').setDescription('The trooper you wish to boot').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('The reason for dismissal')
                .addChoices(
                    { name: 'Left', value: 'Left' },
                    { name: 'Activity', value: 'Activity' },
                    { name: 'Minge', value: 'Minge' },
                    { name: 'RDM', value: 'RDM' },
                    { name: 'Staff related', value: 'Staff related' }
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'Officer');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            let name = interaction.options.getString('name');

            await interaction.reply({
                content: '<:SheetMoment:1136068085682552832> Sent **' + name + '** back to Kamino :skull:',
            });

            const memberData = await getClanData(name);
            console.log(memberData);
            const memberDid = memberData.did;
            if (memberDid) {
                const guild = interaction.guild; // Use the interaction's guild
                if (!guild) {
                    console.error("Guild not found.");
                    return;
                }
                try {
                    const member = await guild.members.fetch(memberDid);
                    if (member) {
                        for (const roleId of role_removal_list) {
                            // Remove the roles from the did received
                            try {
                                await member.roles.remove(roleId);
                                console.log(`Removed role with ID ${roleId} from member ${member.user.tag}`);
                            } catch (error) {
                                console.error(`Failed to remove role with ID ${roleId} from member ${member.user.tag}:`, error);
                            }
                        }
                    } else {
                        console.log(`Member with DID ${memberDid} not found in the guild.`);
                    }
                } catch (error) {
                    console.error(`Error fetching member with DID ${memberDid}:`, error);
                    console.log(`Likely the member with DID ${memberDid} has left the server.`);
                }
            }


            await removeClanMember(name)

        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }
    }
};