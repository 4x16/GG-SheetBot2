const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
// Import specific functions you'll use from database.js
// You will need to add `updateMultipleTaskCounts` to database.js
const {
    retreiveAllTasks,
    getClanDataDid,
    delAllTasks,
    getConnection, // We'll use this directly in approveall for better connection management
    updateMultipleTaskCounts, // NEW function to be added to database.js
    syncDataToSheet // Call this only once at the end
} = require('/opt/GG-SheetBot2/src/events/database.js'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('approveall')
        .setDescription('Approve all pending tasks.')
        .setDMPermission(false),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find(role => role.name === 'Officer');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            await interaction.deferReply({ content: '<:SheetMoment:1136068085682552832> Approving all pending tasks...' });

            let connection; // Declare the connection variable here
            try {
                // Open a single database connection for all operations in this command
                connection = await getConnection();

                const allTasks = await retreiveAllTasks(connection); // Pass the connection
                let approvedTaskCount = 0;

                if (!allTasks || allTasks.length === 0) {
                    await interaction.editReply({ content: '<:SheetMoment:1136068085682552832> There are no pending tasks to approve.' });
                    return; // Return here, finally block will close connection
                }

                const userTaskCounts = new Map();
                // Iterate through all tasks to count tasks per user
                for (const task of allTasks) {
                    const did = task.did;
                    userTaskCounts.set(did, (userTaskCounts.get(did) || 0) + 1);
                }

                const updatesToPerform = [];

                // Prepare batch updates
                for (const [did, taskCount] of userTaskCounts) {
                    // Fetch clan data using the same open connection
                    const clanData = await getClanDataDid(did, connection);
                    if (clanData) {
                        const currentTaskCount = clanData.taskcount || 0;
                        updatesToPerform.push({ did, newCount: currentTaskCount + taskCount });
                    }
                }

                // Perform all `taskcount` updates in one batch operation
                if (updatesToPerform.length > 0) {
                    // This is a NEW function you'll add to database.js
                    await updateMultipleTaskCounts(updatesToPerform, connection);
                }

                approvedTaskCount = allTasks.length;

                // Delete all tasks using the same open connection
                await delAllTasks(connection);

                // Only sync to Google Sheet ONCE after all database operations are done
                await syncDataToSheet();

                await interaction.editReply({ content: `<:SheetMoment:1136068085682552832> Successfully approved **${approvedTaskCount}** pending tasks.` });

            } catch (error) {
                console.error('Error approving all tasks:', error);
                await interaction.editReply({ content: '<:SheetMoment:1136068085682552832> An error occurred while approving all tasks.' });
            } finally {
                // Ensure the connection is always closed
                if (connection) {
                    await connection.end();
                }
            }

        } else {
            await interaction.reply({ content: '<:SheetMoment:1136068085682552832> You do not have permission to use this command.' });
        }
    },
};