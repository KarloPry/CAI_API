const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cai_db'
});

pool.query = util.promisify(pool.query);

module.exports = pool;