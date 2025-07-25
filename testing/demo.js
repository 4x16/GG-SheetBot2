const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'roo',       // Replace with the username you created
  password: '2yvfem63', // Replace with the password you set
  database: 'navyroster' // Replace with the name of your database
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');

  // You can perform database operations here

  connection.end((err) => {
    if (err) {
      console.error('Error closing MySQL connection:', err);
      return;
    }
    console.log('MySQL connection closed.');
  });
});
