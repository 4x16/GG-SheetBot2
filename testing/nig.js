const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'roo',
  password: '2yvfem63',
  database: 'navyroster'
});

connection.connect(async (err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');

  const selectSql = 'SELECT * FROM `navy roster`';

  connection.query(selectSql, async (selectError, selectResults) => {
    if (selectError) {
      console.error('Error selecting data:', selectError);
      connection.end();
      return;
    }
    console.log('Data selected successfully.');

    const webhookUrl = 'https://script.google.com/macros/s/AKfycbzDrfDLVXxSLtUVSU0ncm_7VUYSHy6YfriScMkIbC3bpjMfnRoZ039CdZJ3FxONgAs/exec';
    const postData = JSON.stringify({
      event: 'full_table_data',
      data: selectResults
    });

    try {
      const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
        // Removed 'redirect: 'manual'
      });

      console.log('Response Status Code:', response.status);
      //console.log('Redirected To:', response.headers.get('location'));  Removed this line


      if (response.status >= 200 && response.status < 300) {
        const responseBody = await response.text();
        console.log('Webhook Response Body:', responseBody);
      } else {
        const responseBody = await response.text();
        console.error('Webhook Error Response Body:', responseBody);
      }
    } catch (error) {
      console.error('Error sending webhook request:', error);
    } finally {
      connection.end();
    }
  });
});

