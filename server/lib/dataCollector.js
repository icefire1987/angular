/**
 * Created by Chris on 14.11.16.
 */
var crypto = require('crypto');

var db = require('../lib/db.js');
var pool = db.getPool();

module.exports = {
    articlegender : function(callback) {
        var query = " SELECT id,name,icon FROM options_gender WHERE visible=1 ORDER BY sort";

        pool.getConnection(function (err, connection) {
            connection.query(query , function (err, rows) {
                connection.release();
                if (err) {
                    return callback(err, null);
                }
                if (rows.length > 0) {
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        });
    },
    articlewg : function(callback) {
        var query = " SELECT id,GROUP_CONCAT(name ORDER BY depth) as name,icon,max(depth) as depth FROM options_wg WHERE visible=1 GROUP BY groupID";

        pool.getConnection(function (err, connection) {
            connection.query(query , function (err, rows) {
                connection.release();
                if (err) {
                    return callback(err, null);
                }
                if (rows.length > 0) {
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        });
    },
    commenttype : function(callback) {
        var query = " SELECT id, name,icon,identifier FROM options_comment WHERE visible=1 ";
        pool.getConnection(function (err, connection) {
            connection.query(query , function (err, rows) {
                connection.release();
                if (err) {
                    return callback(err, null);
                }
                if (rows.length > 0) {
                    return callback(null, rows);
                } else {
                    return callback(err, null);
                }
            });
        });
    },
};