/**
 * Created by Chris on 13.11.16.
 */
var mysql = require('mysql');
var pool;
module.exports = {
    getPool: function () {
        if (pool) return pool;
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'pass',
            database: 'zuumeo_studio',
            queueLimit: 40
        });
        return pool;
    }
};