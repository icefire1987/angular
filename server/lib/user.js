/**
 * Created by Chris on 14.11.16.
 */
var crypto = require('crypto');

var db = require('../lib/db.js');
var pool = db.getPool();

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
}

module.exports = {
    get : function(colname,value,callback){
        var query = "";
        switch(colname){
            case "username":
                query = 'select * from user WHERE username=?';
                break;
            case "email":
                query = 'select * from user WHERE email=?';
                break;
            case "id":
                query = 'select * from user WHERE id=?';
                break;
            case "team":
                query = 'select user.id, user.username,user.email, roles.name as role,roles.id as roleID from teams_user LEFT JOIN user ON teams_user.userID = user.id LEFT JOIN roles ON teams_user.roleID = roles.id WHERE teamID=?';
                break;
            case "keyaccount":
                query = ' select user.id, user.username, user.prename, user.lastname,CONCAT(user.prename," ",user.lastname) as name, user.avatar, user.avatar_alt from user LEFT JOIN user_is ON user.id = user_is.userID AND user_is.name="keyaccount" WHERE user_is.userID is not null';
                break
            default:
                query = 'select * from user WHERE username=?';
                break;
        }
        pool.getConnection(function (err, connection) {
            connection.query(query, [value], function (err, rows) {
                connection.release();
                if(err){
                    return callback(err,null);
                }
                if (rows.length > 0) {
                    return callback(null,rows);
                }else{
                    return callback(err,null);
                }
            });
        });
    },
    put: function(userID, userObj,callback){

        var params = {};
        var criteria = [];
        for(var key in userObj){
            if(userObj.hasOwnProperty(key)){
                params[key] = userObj[key];
            }
        }
        criteria.push(params);
        criteria.push(userID);

        var query = "UPDATE user SET ? WHERE id=?";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, criteria, function (err, rows) {
                connection.release();
                if(err){
                    return callback(err,null);
                }
                if (rows.affectedRows > 0) {
                    return callback(null,true);
                }else{
                    return callback(err,null);
                }
            });
        });
    },
    updateToken : function(userid,token,callback){

        var query = 'UPDATE user SET session_token=? WHERE id=?';
        pool.getConnection(function (err, connection) {
            connection.query(query, [token,userid], function (err, rows) {
                connection.release();
                if(err){
                    return callback(null,err);
                }
                if (rows.affectedRows > 0) {

                    return callback(true,null);
                }else{
                    return callback(null,err);
                }
            });
        });
    },
    newsRead : function(userid,callback){
        var query = 'UPDATE user SET lastRead=NOW() WHERE id=?';
        pool.getConnection(function (err, connection) {
            connection.query(query, [userid], function (err, rows) {
                connection.release();
                if(err){
                    return callback(err,null);
                }
                if (rows.affectedRows > 0) {
                    return callback(null,true);
                }else{
                    return callback(err,null);
                }
            });
        });
    }
};