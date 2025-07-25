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
const webhookUrl = 'https://script.google.com/macros/s/AKfycbxEOKzQUmXVFQnVi0-u1C9y3U1nc7r79UdiCvlYZj6oBWEqe6RDr_2fzTso4WxW2KqF/exec';

async function syncDataToSheet() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM `navy roster`'); // Selecting from your table

    console.log('Data retrieved from MySQL:', rows); // ADD THIS LINE TO LOG THE DATA

    // Send the data to the Google Apps Script Webhook
    const response = await axios.post(webhookUrl, rows);

    if (response.data.status === 'success') {
      console.log('Data synced to Google Sheet successfully!');
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

// Run the sync function
syncDataToSheet();
