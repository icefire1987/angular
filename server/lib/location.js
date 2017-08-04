/**
 * Created by Chris on 14.11.16.
 */

var db = require('../lib/db.js');
var pool = db.getPool();

var vm = this;
vm.deleteUsers =  function(teamID,callback){

};
module.exports = {
    get_stage: function(filter,callback){
        var where = "";
        var orderby = "";
        var limit = "";
        var data_to_insert = [];
        for(var filterKey in filter){
            switch(filterKey){
                case "latest":
                    if(orderby.length>0){ orderby += ","}else{ orderby += " ORDER BY " };
                    orderby += " orders.created DESC ";
                    limit +=  " LIMIT "+filter[filterKey];
                    break;
                case "name":
                    if(where.length>0){ where += " AND "}else{ where += " where " };
                    where += " stages.name LIKE ? ";
                    data_to_insert.push("%"+filter[filterKey]+"%");
                    break;
                case "id":
                    if(where.length>0){ where += " AND "}else{ where += " where " };
                    where += " stages.id = ? ";
                    data_to_insert.push(filter[filterKey]);
                    break;
            }
        }

        var query = "SELECT " +
            "stages.id, stages.name, stages.active, stages.icon " +
            "FROM stages " +
            ""+where+" "+limit;

        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data_to_insert, function (err, rows) {
                connection.release();
                if(err){
                    console.log("getConnErr:" + err)
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

    get_process: function(filter,callback){
        var where = "";
        var having = "";
        var groupby = "";
        var limit = "";
        var data_to_insert = [];
        for(var filterKey in filter){
            switch(filterKey){
                case "join_id":
                    if(having.length>0){ having += " AND "}else{ having += " HAVING " };
                    having += " GROUP_CONCAT(stages.id SEPARATOR ',') = ? ";
                    data_to_insert.push(filter[filterKey]);

                    if(groupby.length>0){ groupby += " , "}else{ groupby += " GROUP BY " };
                    groupby += " processes.id ";

                    break;
                case "name":
                    if(having.length>0){ having += " AND "}else{ having += " HAVING " };
                    having += " name LIKE ? ";
                    data_to_insert.push('%' + filter[filterKey] + '%');

                    if(groupby.length>0){ groupby += " , "}else{ groupby += " GROUP BY " };
                    groupby += " processes.id ";

                    break;
                case "id":
                    if(where.length>0){ where += " AND "}else{ where += " where " };
                    where += " processes.id = ? ";
                    data_to_insert.push(filter[filterKey]);
                    break;
            }
        }

        var query = "SELECT " +
            "processes.id, " +
            "processes.description, " +
            "GROUP_CONCAT(stages.name) as name, " +
            "CONCAT('[',GROUP_CONCAT(JSON_OBJECT('name', stages.name, 'final', stagesets.final, 'icon', stages.icon)) ,']') as stages_json " +
            "FROM processes " +
            "LEFT JOIN stagesets ON stagesets.processID = processes.id " +
            "LEFT JOIN stages ON stages.id = stagesets.stageID " +
            ""+where+" "+groupby+" "+having+" "+limit;

        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data_to_insert, function (err, rows) {
                connection.release();
                if(err){
                    console.log("getConnErr:" + err)
                    return callback(err,null);
                }
                if (rows.length > 0) {
                    for(var x=0; x<rows.length;x++){
                        if(rows[x].stages_json){
                            rows[x].stages_json = JSON.parse(rows[x].stages_json);
                        }

                    }
                    return callback(null,rows);
                }else{
                    return callback(err,null);
                }
            });
        });
    },

    update_stage: function(data,callback){
        if(data.stageID == undefined || data.stageID == ""){
            var err ={userFeedback: 'Station is missing'};
            return callback(err,null);
        }
        var insert_data = data.data;

        var where = [
            data.stageID
        ];

        var query = "UPDATE stages SET ? WHERE id=? ";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, [insert_data,where], function (err, rows) {
                connection.release();
                if(err){
                    console.log("getConnErr:" + err)
                    return callback(err,null);
                }else if (rows.affectedRows > 0) {
                    return callback(null,{id: rows.insertId});
                }else{
                    return callback(err,null);
                }
            });
        });
    },
    post_stage: function(data,callback){
        if(data.name == undefined || data.name == ""){
            var err ={userFeedback: 'Name is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            name: data.name,
        };

        var query = "REPLACE INTO stages SET ?";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data_to_insert, function (err, rows) {
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
    post_process: function(data,callback){
        if(data.description == undefined || data.description == ""){
            var err ={userFeedback: 'description is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            description: data.description,
        };

        var query = "REPLACE INTO processes SET ?";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data_to_insert, function (err, rows) {
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
    post_stageset: function(data,callback){
        if(data.processID == undefined || data.processID == ""){
            var err ={userFeedback: 'processID is missing'};
            return callback(err,null);
        }
        if(data.stages == undefined || data.stages.length<1){
            var err ={userFeedback: 'stages is missing'};
            return callback(err,null);
        }

        var data_to_insert = [];
        for(var stagekey in data.stages){
            data_to_insert.push([data.processID, data.stages[stagekey].id,0,data.stages[stagekey].final])
        }
        var query = "INSERT INTO stagesets (processID,stageID,optional,final) VALUES ? ON DUPLICATE KEY UPDATE final = VALUES(final) ";

        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, [data_to_insert], function (err, rows) {
                connection.release();
                if(err){
                    console.log("getConnErr:" + err)
                    return callback(err,null);
                }
                console.log(rows)
                if (rows.affectedRows > 0) {
                    return callback(null,{id: rows.insertId});
                }else{
                    return callback(err,null);
                }
            });
        });
    }
};