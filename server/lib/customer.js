/**
 * Created by Chris on 14.11.16.
 */

var db = require('../lib/db.js');
var pool = db.getPool();

var vm = this;
vm.deleteUsers =  function(teamID,callback){

};
module.exports = {
    get : function(colname,value,options,callback){
        var clean_value = value;
        var queryValues = [];
        switch(colname){
            case "name":
                clean_value = "%"+value+"%";
                if(options){
                    if(options.unique){
                        clean_value = value;
                    }
                }
                var query = 'select customers.* from customers WHERE customers.name LIKE ?';
                queryValues.push(clean_value);
                break;
            case "id":
                var query = 'select customers.* from customers WHERE customers.id=?';
                queryValues.push(userID);
                queryValues.push(clean_value);
                break;
            default:
                var query = 'select customers.* from customers';
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
        if(data.name == undefined || data.name == ""){
            var err ={userFeedback: 'Customername is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            name: data.name,
        };
        if(data.id){
            data_to_insert.id = data.id;
        }
        var query = "INSERT INTO customers SET ? ON DUPLICATE KEY update name=name";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, data_to_insert, function (err, rows) {
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
    post_retour: function(data,callback){
        if(data.customerID == undefined || data.customerID == ""){
            var err ={userFeedback: 'Data is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            customerID: data.customerID,
            person: data.person,
            street: data.street,
            postal: data.postal,
            city: data.city
        };
        if(data.id){
            data_to_insert.id = data.id;
        }
        var query = "REPLACE INTO customers_retour SET ?";
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
    post_keyaccount: function(data,callback){
        if(data.userID == undefined || data.userID == ""){
            var err ={userFeedback: 'User is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            userID: data.userID,
            customerID: data.customerID
        };

        var query = "REPLACE INTO customers_user SET ?";
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