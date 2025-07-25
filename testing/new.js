const mysql = require('mysql');
const https = require('https');

const connection = mysql.createConnection({
  // Your database connection details
  host: 'localhost',
  user: 'roo',
  password: '2yvfem63',
  database: 'navyroster'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');

  // Example of inserting data
  const newData = { name: 'New Sailor', rank: 'Recruit', enlisted_date: '2025-04-19' };
  const insertSql = 'INSERT INTO `navy roster` (name, `rank`, enlisted_date) VALUES (?, ?, ?)';
  const insertValues = [newData.name, newData.rank, newData.enlisted_date];

  connection.query(insertSql, insertValues, (insertError, insertResults) => {
    if (insertError) {
      console.error('Error inserting data:', insertError);
      connection.end();
      return;
    }
    console.log('Data inserted successfully. Row ID:', insertResults.insertId);

    // --- Send Webhook request after successful insertion ---
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbzDrfDLVXxSLtUVSU0ncm_7VUYSHy6YfriScMkIbC3bpjMfnRoZ039CdZJ3FxONgAs/exec';
    const postData = JSON.stringify({
      event: 'insert',
      data: { id: insertResults.insertId, ...newData } // Include the inserted data
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(webhookUrl, options, (res) => {
      console.log('Webhook Response Status Code:', res.statusCode);
      res.on('data', (chunk) => {
        console.log('Webhook Response Body:', chunk.toString());
      });
    });

    req.on('error', (error) => {
      console.error('Error sending webhook request:', error);
    });

    req.write(postData);
    req.end();
    connection.end();
  });

  // You'll need to add similar logic after UPDATE and DELETE operations
});
