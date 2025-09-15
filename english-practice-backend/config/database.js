const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'english_practice'
});

connection.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối đến MySQL: ' + err.stack);
    return;
  }
  console.log('Kết nối đến MySQL thanh công. Đến ID: ' + connection.threadId);
});

module.exports = connection;