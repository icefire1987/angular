/**
 * Created by Chris on 14.11.16.
 */

var db = require('../lib/db.js');
var pool = db.getPool();

var vm = this;
vm.deleteUsers =  function(teamID,callback){

};
module.exports = {
    get: function(filter,callback){
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
            "stages.id, stages.name, stages.active " +
            "FROM stages " +
            ""+where+" "+limit;
        console.log(query)
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
    }
};