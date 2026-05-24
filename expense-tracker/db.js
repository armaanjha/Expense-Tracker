// db.js — MySQL connection setup
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // change to your MySQL username
    password: '',        // change to your MySQL password
    database: 'expense_tracker'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

module.exports = db;
