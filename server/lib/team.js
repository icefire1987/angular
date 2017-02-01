/**
 * Created by Chris on 14.11.16.
 */

var db = require('../lib/db.js');
var pool = db.getPool();

var vm = this;
vm.deleteUsers =  function(teamID,callback){
    var query = 'DELETE FROM teams_user WHERE teamID=?';

    pool.getConnection(function (err, connection) {
        if(!err){
            connection.query(query, teamID, function (err, rows) {
                connection.release();
                if(err){
                    return callback(err,null);
                }else if (rows.affectedRows > 0) {
                    return callback(null,true);
                }else{
                    var err =  {debug : "Team nicht gefunden"};
                    return callback(err,null);
                }
            });
        }else{
            var err =  {debug : err};
            return callback(err,null);
        }

    });
};
module.exports = {
    get : function(colname,value,options,callback){
        var userID = global_user.id;
        clean_value = value;
        var queryValues = [];
        switch(colname){
            case "name":
                clean_value = "%"+value+"%";
                if(options){
                    if(options.unique){
                        clean_value = value;
                    }
                }
                var query = 'select teams.*,user.username,user.email from teams LEFT JOIN user ON user.id = teams.userCreate WHERE teams.name LIKE ?';
                queryValues.push(clean_value);
                break;
            case "id":
                var query = 'select teams.*, ' +
                    'roles.right_team_edit as right_team_edit,' +
                    'roles.right_team_edit_role as right_team_edit_role,' +
                    'roles.right_team_edit_data as right_team_edit_data,' +
                    'roles.name as role ' +
                    'from teams ' +
                    'LEFT JOIN teams_user ON teams_user.teamID = teams.id AND teams_user.userID = ? ' +
                    'LEFT JOIN roles ON teams_user.roleID = roles.id ' +
                    'WHERE teams.id=?';
                queryValues.push(userID);
                queryValues.push(clean_value);
                break;
            case "userCreate":
                var query = 'select * from teams WHERE userCreate=?';
                queryValues.push(clean_value);
                break;
            case "user":
                var query = 'select ' +
                        'teams.*,' +
                        'roles.right_team_edit as right_team_edit,' +
                        'roles.right_team_edit_role as right_team_edit_role,' +
                        'roles.right_team_edit_data as right_team_edit_data,' +
                        'roles.name as role ' +
                    'FROM teams ' +
                    'LEFT JOIN teams_user ON teams_user.teamID = teams.id  AND userID=? ' +
                    'LEFT JOIN roles ON teams_user.roleID = roles.id ' +
                    'WHERE userCreate=? OR teams_user.id IS NOT NULL ' +

                    'ORDER BY (userCreate=IFNULL(userID,0)) DESC, teams.name ASC ';
                queryValues.push(clean_value);
                queryValues.push(clean_value);
                break;
            default:
                var query = 'select * from teams WHERE name=?';
                queryValues.push(clean_value);
                break;
        }
        pool.getConnection(function (err, connection) {
            connection.query(query, queryValues, function (err, rows) {
                connection.release();
                if(err){
                    console.log("err")
                    console.log(err)
                    return callback(err,null);
                }else if (rows.length > 0) {
                    return callback(null,rows);
                }else{
                    return callback(err,null);
                }
            });
        });
    },

    post: function(data,callback){
        console.log("post team")
        console.log(data)
        if(data.teamname == undefined || data.teamname == ""){
            var err ={userFeedback: 'Teamname is missing'};
            return callback(err,null);
        }
        if(data.openJoin == undefined){
            data.openJoin = "0";
        }
        if(data.dateCreate == undefined){
            data.dateCreate = new Date();
        }
        if(data.description == undefined){
            data.description = "";
        }
        if(data.imagepath == undefined){
            data.imagepath == "";
        }
        var teamdata = {
            name: data.teamname,
            openJoin : data.openJoin,
            description: data.description,
            dateCreate: data.dateCreate,
            userCreate: data.userCreate,
            avatar: data.avatar,
            avatar_alt : data.avatar_alt
        };
        if(data.id){
            teamdata.id = data.id;
        }

        var query = "REPLACE INTO teams SET ?";
        pool.getConnection(function (err, connection) {
            //teamdata.dateCreate = connection.escape(teamdata.dateCreate);
            var sql = connection.query(query, teamdata, function (err, rows) {
                connection.release();
                if(err){
                    console.log("getConnErr:" + err)
                    return callback(err,null);
                }
                if (rows.affectedRows > 0) {

                    return callback(null,{id: rows.insertId});
                }else{
                    return callback(err,null);
                }
            });
        });
    },
    delete: function(teamID,callback){
        var query = 'DELETE FROM teams WHERE id=?';

        pool.getConnection(function (err, connection) {
            if(!err){
                connection.query(query, teamID, function (err, rows) {
                    connection.release();
                    if(err){
                        return callback(err,null);
                    }else if (rows.affectedRows > 0) {
                        vm.deleteUsers(teamID,callback);
                    }else{
                        var err =  {debug : "Team nicht gefunden"};
                        return callback(err,null);
                    }
                });
            }else{
                var err =  {debug : err};
                return callback(err,null);
            }

        });
    },

    join: function(teamID,userID,roleID,callback){
        console.log("teamID " + teamID );
        console.log("userID " + userID );
        console.log("roleID " + roleID );
        var query = 'REPLACE INTO teams_user SET userID=?, teamID = ? , roleID = ?, dateJoin=NOW()';
        if(!teamID && !userID){
            var err =  {debug : "Team und User not set"};
            return callback(err,null);
        }
        pool.getConnection(function (err, connection) {
            if(!err){
                connection.query(query, [userID,teamID,roleID], function (err, rows) {
                    connection.release();
                    console.log(err, rows)
                    if(err){
                        return callback(err,null);
                    }else if (rows.affectedRows > 0) {
                        return callback(null,true);
                    }else{
                        var err =  {debug : "Team nicht gefunden"};
                        return callback(err,null);
                    }
                });
            }else{
                var err =  {debug : err};
                return callback(err,null);
            }

        });
    },
    leave: function(teamID,userID,callback){
        var query = 'DELETE FROM teams_user WHERE teamID=? AND userID=?';

        pool.getConnection(function (err, connection) {
            if(!err){
                connection.query(query, [teamID,userID], function (err, rows) {
                    connection.release();
                    if(err){
                        return callback(err,null);
                    }else if (rows.affectedRows > 0) {
                        return callback(null,true);
                    }else{
                        var err =  {debug : "Team nicht gefunden"};
                        return callback(err,null);
                    }
                });
            }else{
                var err =  {debug : err};
                return callback(err,null);
            }

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
    static_roles : function(callback){
        var query = 'SELECT * FROM roles';
        pool.getConnection(function (err, connection) {
            connection.query(query, function (err, rows) {
                connection.release();
                if(err){
                    return callback(err,null);
                }
                if (rows) {
                    return callback(null,rows);
                }else{
                    return callback(err,null);
                }
            });
        });
    }
};