const mysql = require('mysql');

const connection = mysql.createConnection({
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

  const newData = [
    { name: 'John Doe', rank: 'Seaman', enlisted_date: '2024-08-15' },
    { name: 'Jane Smith', rank: 'Petty Officer 3rd Class', enlisted_date: '2023-03-20' },
    { name: 'Robert Williams', rank: 'Chief Petty Officer', enlisted_date: '2020-11-01' }
  ];

  newData.forEach(record => {
    const sql = 'INSERT INTO `navy roster` (`name`, `rank`, `enlisted_date`) VALUES (?, ?, ?)'; // Note the backticks around 'rank'
    const values = [record.name, record.rank, record.enlisted_date];

    connection.query(sql, values, (error, results, fields) => {
      if (error) {
        console.error('Error inserting data:', error);
        return;
      }
      console.log('Data inserted successfully. Row ID:', results.insertId);
    });
  });

  connection.end((err) => {
    if (err) {
      console.error('Error closing MySQL connection:', err);
      return;
    }
    console.log('MySQL connection closed.');
  });
});
