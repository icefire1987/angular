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
                query = 'select user.id, user.username,user.email, user.roles,user.salt,user.login, GROUP_CONCAT(teams.name) as teams, user.password from user ' +
                    'LEFT JOIN teams_user On teams_user.userID = user.id ' +
                    'LEFT JOIN teams ON teams.id = teams_user.teamID ' +
                    'WHERE username=? ' +
                    'GROUP BY user.id';
                break;
            case "name":
                var value = "%"+value+"%";
                query = 'select ' +
                    'user.id, user.username,user.email, user.roles,user.salt,user.login,' +
                    'CONCAT(user.prename," ",user.lastname) as fullname, user.prename,user.lastname,GROUP_CONCAT(teams.name) as teams, ' +
                    'JSON_ARRAY(user_is.name) as user_is, ' +
                    'user.password from user ' +
                    'LEFT JOIN teams_user On teams_user.userID = user.id ' +
                    'LEFT JOIN teams ON teams.id = teams_user.teamID ' +
                    'LEFT JOIN user_is ON user_is.userID = user.id ' +
                    'WHERE CONCAT(IFNULL(user.prename,"")," ",IFNULL(user.lastname,"")," ",user.username) LIKE ? ' +
                    'GROUP BY user.id';
                break;
            case "email":
                query = 'select * from user WHERE email=?';
                break;
            case "id":
                query = 'select ' +
                    'user.id, user.username,user.email, user.roles,user.login,' +
                    'CONCAT(user.prename," ",user.lastname) as fullname, user.prename,user.lastname, GROUP_CONCAT(teams.name) as teams, ' +
                    'JSON_ARRAY(IFNULL(user_is.name,"")) as user_is ' +
                    'from user ' +
                    'LEFT JOIN teams_user On teams_user.userID = user.id ' +
                    'LEFT JOIN teams ON teams.id = teams_user.teamID ' +
                    'LEFT JOIN user_is ON user_is.userID = user.id ' +
                    'WHERE user.id = ? ' +
                    'GROUP BY user.id';
                break;
            case "team":
                query = 'select user.id, user.username,user.email, roles.name as role,roles.id as roleID from teams_user ' +
                    'LEFT JOIN user ON teams_user.userID = user.id ' +
                    'LEFT JOIN roles ON teams_user.roleID = roles.id WHERE teamID=?';
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

        var expected = [
            "prename","lastname","avatar_alt","email","username","password","avatar"
        ];
        for(var key in userObj){
            if(userObj.hasOwnProperty(key) && expected.indexOf(key)>-1){
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
    userIs_put: function(data, callback){
        var query = "INSERT INTO user_is SET ? ";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data, function (err, rows) {
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
    userIs_delete: function(data, callback){
        var query = "DELETE FROM user_is WHERE userID=? AND name=? ";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, [data.userID,data.name], function (err, rows) {
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