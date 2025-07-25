const mysql = require('mysql2/promise');
const axios = require('axios');

// MySQL connection details
const dbConfig = {
    host: 'localhost',
    user: 'roo',
    password: '2yvfem63',
    database: 'navyroster'
};

// Google Apps Script Webhook URL
const webhookUrl = 'https://script.google.com/macros/s/AKfycbzveXqdvtD3-TXKXk95imIUIJ-EOA6YqP-LfAh5Gz2TcslmlQP63Soe0pBnxx8zN49IjA/exec';

// --- Helper to get connection (kept as is, but now used externally too) ---
async function getConnection() {
    return mysql.createConnection(dbConfig);
}

// --- syncDataToSheet (kept as is, but now called strategically) ---
async function syncDataToSheet() {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM `navy roster` ORDER BY `rank` DESC, `role`');

        const response = await axios.post(webhookUrl, rows);

        if (response.data.status === 'success') {
            // console.log('Data synced to Google Sheet successfully.'); // Optional: for debugging
        } else {
            console.error('Failed to sync data:', response.data.message);
        }

    } catch (error) {
        console.error('Error syncing data:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// --- Modified existing functions to accept an optional 'existingConnection' ---
// This allows them to reuse a connection opened by the caller
async function getClanDataDid(did, existingConnection) {
    let connection = existingConnection;
    try {
        if (!connection) { // If no existing connection, create a new one
            connection = await getConnection();
        }
        const [rows] = await connection.execute('SELECT * FROM `navy roster` WHERE `did` = ?', [did]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting data for DID:', error);
        throw error;
    } finally {
        if (connection && !existingConnection) { // Only close if we opened it in this function
            await connection.end();
        }
    }
}

async function retreiveAllTasks(existingConnection) {
    let connection = existingConnection;
    try {
        if (!connection) {
            connection = await getConnection();
        }
        const [rows] = await connection.execute('SELECT * FROM `tasklog`');
        return rows;
    } catch (error) {
        console.error('Error retrieving all tasks', error);
        throw error;
    } finally {
        if (connection && !existingConnection) {
            await connection.end();
        }
    }
}

async function delAllTasks(existingConnection) {
    let connection = existingConnection;
    try {
        if (!connection) {
            connection = await getConnection();
        }
        const [result] = await connection.execute('DELETE FROM `tasklog`');
        // IMPORTANT: Removed syncDataToSheet() from here. It will be called once in approveall.js
        return result.affectedRows;
    } catch (error) {
        console.error('Error deleting all tasks', error);
        throw error;
    } finally {
        if (connection && !existingConnection) {
            await connection.end();
        }
    }
}

// --- NEW FUNCTION: updateMultipleTaskCounts ---
// This function will perform a single batched UPDATE query
async function updateMultipleTaskCounts(updates, existingConnection) {
    let connection = existingConnection;
    try {
        if (!connection) {
            connection = await getConnection();
        }

        if (!updates || updates.length === 0) {
            return 0; // No updates to perform
        }

        const queryParts = [];
        const values = []; // For the SET clause values
        const didsInClause = []; // For the WHERE IN clause DIDs

        for (const update of updates) {
            queryParts.push(`WHEN ? THEN ?`); // Placeholder for DID and newCount
            values.push(update.did, update.newCount);
            didsInClause.push(update.did);
        }

        // Construct the query: UPDATE ... SET `field` = CASE ... WHERE `id` IN (...)
        const query = `
            UPDATE \`navy roster\`
            SET \`taskcount\` = CASE \`did\`
                ${queryParts.join('\n')}
                ELSE \`taskcount\` -- Keep existing value if DID not matched (shouldn't happen with WHERE IN)
            END
            WHERE \`did\` IN (${didsInClause.map(() => '?').join(',')});
        `;

        // The values array needs to be constructed correctly:
        // First all values for the CASE statement (did1, newCount1, did2, newCount2, ...)
        // Then all values for the WHERE IN clause (did1, did2, ...)
        const finalValues = [...values, ...didsInClause];

        const [result] = await connection.execute(query, finalValues);
        return result.affectedRows; // Return number of affected rows
    } catch (error) {
        console.error('Error updating multiple task counts:', error);
        throw error;
    } finally {
        if (connection && !existingConnection) {
            await connection.end();
        }
    }
}

// --- Other existing functions (no changes needed for approveall command) ---
// Just ensure they are included in the exports if they are used elsewhere
async function addClanMember(name, rank, role, user, did, alias, recruiter, joindate, promodate, taskcount, activity, performance) {
    let connection;
    try {
        connection = await getConnection();
        const query = `
            INSERT INTO \`navy roster\` (
                \`name\`, \`rank\`, \`role\`, \`user\`, \`did\`, \`alias\`,
                \`recruiter\`, \`joindate\`, \`promodate\`, \`taskcount\`, \`activity\`, \`performance\`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(query, [name, rank, role, user, did, alias, recruiter, joindate, promodate, taskcount, activity, performance]);
        await syncDataToSheet(); // Sync after adding a single member
        return result.insertId;
    } catch (error) {
        console.error('Error adding clan member:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function removeClanMember(name) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT did FROM `navy roster` WHERE name = ?', [name]);
        const [result] = await connection.execute('DELETE FROM `navy roster` WHERE name = ?', [name]);

        if (result.affectedRows > 0) {
            if (rows.length > 0 && rows[0].did) {
                await axios.post(webhookUrl, { action: 'delete', memberId: rows[0].did });
            } else {
                await axios.post(webhookUrl, { action: 'delete', name: name });
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error removing clan member:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function getClanData(name) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM `navy roster` WHERE `name` = ?', [name]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting data for name:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function editMemberValue(name, field, value) {
    let connection;
    try {
        connection = await getConnection();
        const allowedFields = ['name', 'rank', 'role', 'user', 'did', 'alias', 'recruiter',
            'joindate', 'promodate', 'taskcount', 'activity', 'performance'];
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid field name: ${field}`);
        }
        const query = `UPDATE \`navy roster\` SET \`${field}\` = ? WHERE name = ?`;
        const [result] = await connection.execute(query, [value, name]);
        if (result.affectedRows > 0) {
            await syncDataToSheet(); // Sync after editing a single member
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error updating member ${field}:`, error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function editMemberValueId(did, field, value) {
    let connection;
    try {
        connection = await getConnection();
        const allowedFields = ['name', 'rank', 'role', 'user', 'did', 'alias', 'recruiter',
            'joindate', 'promodate', 'taskcount', 'activity', 'performance'];
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid field name: ${field}`);
        }
        const query = `UPDATE \`navy roster\` SET \`${field}\` = ? WHERE did = ?`;
        const [result] = await connection.execute(query, [value, did]);
        if (result.affectedRows > 0) {
            await syncDataToSheet(); // Sync after editing a single member
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error updating member ${field} with DID ${did}:`, error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function addTask(task, description, user, did) {
    let connection;
    try {
        connection = await getConnection();
        const query = `
            INSERT INTO \`tasklog\` (
                \`taskid\`, \`task\`, \`description\`, \`user\`, \`did\`
            ) VALUES (generate_unique_taskid(), ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(query, [task, description, user, did]);
        await syncDataToSheet(); // Sync after adding a single task
        return result.insertId;
    } catch (error) {
        console.error('Error adding task', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function retreiveTasks() {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT * FROM `tasklog`');
        return rows;
    } catch (error) {
        console.error('Error retrieving tasks', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function delTask(taskid) {
    let connection;
    try {
        connection = await getConnection();
        const [result] = await connection.execute('DELETE FROM `tasklog` WHERE taskid = ?', [taskid]);
        await syncDataToSheet(); // Sync after deleting a single task
        return result.affectedRows;
    } catch (error) {
        console.error('Error deleting task', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

async function retreiveDidTask(taskid) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT did FROM `tasklog` WHERE taskid = ?', [taskid]);
        if (rows.length > 0) {
            return rows[0].did;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error retrieving DID for task ID:', error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

module.exports = {
    addClanMember,
    removeClanMember,
    getClanData,
    getClanDataDid,
    editMemberValue,
    addTask,
    delTask,
    retreiveTasks,
    editMemberValueId, // Keep for other commands that might use it
    retreiveDidTask,
    retreiveAllTasks,
    delAllTasks,
    getConnection, // Export getConnection to be used by approveall
    updateMultipleTaskCounts, // Export the NEW batch update function
    syncDataToSheet // Export syncDataToSheet so approveall can call it directly
};