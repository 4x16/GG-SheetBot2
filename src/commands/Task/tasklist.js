const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { retreiveTasks } = require('/opt/GG-SheetBot2/src/events/database.js');

// Helper function to pad a string to a certain length
function padRight(str, len) {
    return str + ' '.repeat(Math.max(0, len - str.length));
}

// Function to split a string into chunks, respecting newline characters
function chunkStringByLines(str, maxLength) {
    const lines = str.split('\n');
    const chunks = [];
    let currentChunk = '';

    for (const line of lines) {
        const lineWithNewline = line + '\n';

        if (currentChunk.length + lineWithNewline.length <= maxLength - 6) { // Leave space for ```\n and ```
            currentChunk += lineWithNewline;
        } else {
            chunks.push(currentChunk);
            currentChunk = lineWithNewline;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}

module.exports = {
    data: new SlashCommandBuilder().setName('tasklist').setDescription('Retrieve the list of unapproved tasks.').setDMPermission(false),

    async execute(interaction) {
        const role = interaction.guild.roles.cache.find((role) => role.name === 'Officer');
        if (interaction.member.roles.cache.has(role.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            try {
                await interaction.deferReply({ ephemeral: false }); // Defer the initial reply

                const tasks = await retreiveTasks();

                if (!tasks || tasks.length === 0) {
                    await interaction.editReply({ content: '<:SheetMoment:1136068085682552832> There are no tasks to approve.' });
                    return;
                }

                // Trim whitespace from the data
                const trimmedTasks = tasks.map(task => ({
                    taskid: String(task.taskid).trim(),
                    task: String(task.task).trim(),
                    description: String(task.description).trim(),
                    user: String(task.user).trim(),
                }));

                // Determine maximum lengths based on data only
                const maxTaskIDLength = Math.max(...trimmedTasks.map(task => task.taskid.length), 'Task ID'.length);
                const maxTaskLength = Math.max(...trimmedTasks.map(task => task.task.length), 'Task'.length);
                const maxDescriptionLength = Math.max(...trimmedTasks.map(task => task.description.length), 'Description'.length);
                const maxUserLength = Math.max(...trimmedTasks.map(task => task.user.length), 'User'.length);

                let formattedTasks = '';
                for (const task of trimmedTasks) {
                    const paddedTaskID = padRight(task.taskid, maxTaskIDLength);
                    const paddedTask = padRight(task.task, maxTaskLength);
                    const paddedDescription = padRight(task.description, maxDescriptionLength);
                    const paddedUser = padRight(task.user, maxUserLength);

                    formattedTasks += `${paddedTaskID} | ${paddedTask} | ${paddedDescription} | ${paddedUser}\n`;
                }

                const header = `${padRight('Task ID', maxTaskIDLength)} | ${padRight('Task', maxTaskLength)} | ${padRight('Description', maxDescriptionLength)} | ${padRight('User', maxUserLength)}\n`;
                const fullText = `${header}${formattedTasks}`;
                const taskListChunks = chunkStringByLines(fullText, 2000);

                await interaction.editReply({ content: `\`\`\`${taskListChunks[0]}\`\`\`` });

                for (let i = 1; i < taskListChunks.length; i++) {
                    await interaction.followUp({ content: `\`\`\`${taskListChunks[i]}\`\`\``, ephemeral: false });
                }

            } catch (error) {
                console.error('Error retrieving tasks:', error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'An error occurred while retrieving the task list.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'An error occurred while retrieving the task list.', ephemeral: true });
                }
            }
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
    },
};