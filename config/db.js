const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'talleres_sac'
});

pool.query = util.promisify(pool.query);

module.exports = pool;