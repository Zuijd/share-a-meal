const mysql = require('mysql2');
require('dotenv').config();
const pool = mysql.createPool({
    multipleStatements: true,
    connectionLimit: 500,
    queueLimit: 500,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: 'cest'
});

pool.on('connection', (connection) => {
    connection.query('SET SESSION auto_increment_increment=1')
});

module.exports = pool;