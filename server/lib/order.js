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
        var data_to_insert = {};
        for(var filterKey in filter){
            switch(filterKey){
                case "latest":
                    if(orderby.length>0){ orderby += ","}else{ orderby += " ORDER BY " };
                    orderby += " orders.created DESC ";
                    limit +=  " LIMIT "+filter[filterKey];
                    break;
            }
        }

        var query = "SELECT " +
            " user.prename as keyaccount_prename, user.lastname as keyaccount_lastname, user.avatar as keyaccount_avatar, user.avatar_alt as keyaccount_avatar_alt, " +
            " customers.name as customer_name, COUNT(orders_articles.articleID) as article_count, " +
            " customers.logo, orders.created,orders.comment, orders.id " +
            " FROM orders LEFT JOIN orders_user ON orders_user.orderID=orders.id " +
            " LEFT JOIN user ON user.id=orders_user.userID " +
            " LEFT JOIN customers ON customers.id=orders.customerID " +
            " LEFT JOIN orders_articles ON orders.id=orders_articles.orderID " +
            ""+where+" GROUP BY orders.id "+orderby+limit;
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
    post_new: function(data,callback){
        if(data.customerID == undefined || data.customerID == ""){
            var err ={userFeedback: 'Customer is missing'};
            return callback(err,null);
        }
        if(data.userID == undefined || data.userID == ""){
            data.userID = 0;
        }
        if(data.description == undefined || data.description == ""){
            data.description = "";
        }
        var data_to_insert = {
            customerID: data.customerID,
            comment: data.description,
            userID: global_user.id
        };

        var query = "REPLACE INTO orders SET ?";
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
        if(data.orderID == undefined || data.orderID == ""){
            var err ={userFeedback: 'Order is missing'};
            return callback(err,null);
        }
        if(data.userID == undefined || data.userID == ""){
            var err ={userFeedback: 'User is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            userID: data.userID,
            orderID: data.orderID
        };

        var query = "REPLACE INTO orders_user SET ?";
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