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
                var query = 'select ' +
                    'customers.*, ' +
                    'IF(user.username is null,null,CONCAT("[",GROUP_CONCAT(JSON_OBJECT(' +
                    '"username", user.username,"prename", user.prename,"lastname", user.lastname,' +
                    '"avatar", user.avatar,"avatar_alt", user.avatar_alt' +
                    ')),"]" )) as users ' +
                    'from customers ' +
                    'LEFT JOIN customers_user ON customers_user.customerID = customers.id ' +
                    'LEFT JOIN user ON customers_user.userID = user.id ' +
                    'WHERE customers.name LIKE ? ' +
                    'GROUP BY customers.id ';
                /*var query1 = 'select ' +
                    'customers.*, ' +
                    'IF(user.username is null,null,JSON_ARRAY(GROUP_CONCAT(JSON_OBJECT(' +
                    '"username", user.username,"prename", user.prename,"lastname", user.lastname,' +
                    '"avatar", user.avatar,"avatar_alt", user.avatar_alt' +
                    ')))) as users ' +
                    'from customers ' +
                    'LEFT JOIN customers_user ON customers_user.customerID = customers.id ' +
                    'LEFT JOIN user ON customers_user.userID = user.id ' +
                    'WHERE customers.name LIKE ? ' +
                    'GROUP BY customers.id ';*/
                queryValues.push(clean_value);

                break;
            case "id":
                var query = 'select ' +
                    'customers.*, ' +
                    'IF(user.username is null,null,CONCAT("[",GROUP_CONCAT(JSON_OBJECT(' +
                    '"username", user.username,"prename", user.prename,"lastname", user.lastname,' +
                    '"avatar", user.avatar,"avatar_alt", user.avatar_alt,"id", user.id' +
                    ')),"]" )) as users ' +
                    'from customers ' +
                    'LEFT JOIN customers_user ON customers_user.customerID = customers.id ' +
                    'LEFT JOIN user ON customers_user.userID = user.id ' +
                    'WHERE customers.id = ? ' +
                    'GROUP BY customers.id ';

                queryValues.push(value);
                break;
            default:
                var query = 'select customers.*,user.id as userID, user.username as userUsername,CONCAT(user.prename," ",user.lastname) as userName,user.avatar as userAvatar,count(orders.id) as orders_count from customers ' +
                    'LEFT JOIN orders ON orders.customerID = customers.id ' +
                    'LEFT JOIN customers_user ON customers_user.customerID = customers.id ' +
                    'LEFT JOIN user ON customers_user.userID = user.id ' +
                    'GROUP BY customers.id ' +
                    'ORDER BY customers.name';
                break;
        }
        pool.getConnection(function (err, connection) {
            if(err){return callback(err,null);}

            connection.query(query, queryValues, function (err, rows) {
                connection.release();
                if(err){
                    console.log("err")
                    console.log(err)
                    return callback(err,null);
                }else if (rows.length > 0) {
                    for(var x=0; x<rows.length;x++){
                        if(rows[x].users){
                            rows[x].users = JSON.parse(rows[x].users);
                        }

                    }
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
    post_retouraddress: function(data,callback){
        if(data.customerID == undefined || data.customerID == ""){
            var err ={userFeedback: 'Data is missing'};
            return callback(err,null);
        }

        var data_to_insert = {
            customerID: data.customerID,
            person: data.person,
            street: data.street,
            postal: data.postal,
            city: data.city,
            comment: data.comment
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
    update_retouraddress: function(data,callback){
        console.log(data)
        if(!data.action){
            var err ={userFeedback: 'Data is missing'};
            return callback(err,null);
        }
        switch(data.action){
            case 'deactivate':
                var data_obj = {
                    active: 0
                };
                break;
            case 'activate':
                var data_obj = {
                    active: 1
                };
                break;
        }
        if(data_obj){
            console.log("test");
            var query = "UPDATE customers_retour SET ? WHERE id=?";
            pool.getConnection(function (err, connection) {
                var sql = connection.query(query, [data_obj,data.data.id], function (err, rows) {
                    connection.release();
                    console.log(data_obj)
                    console.log(data.data.id)
                    console.log(rows)

                    if(err){
                        console.log("getConnErr:" + err)
                        return callback(err,null);
                    }
                    return callback(null,true);

                });
            });
        }
    },
    post_keyaccount: function(data,callback){
        console.log(data)
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
    },
    remove_keyaccount: function(data,callback){
        if(data.userID == undefined || data.userID == ""){
            var err ={userFeedback: 'User is missing'};
            return callback(err,null);
        }
        if(data.customerID == undefined || data.customerID == ""){
            var err ={userFeedback: 'Customer is missing'};
            return callback(err,null);
        }

        var where = [
            data.userID,data.customerID
        ];

        var query = "DELETE FROM customers_user WHERE userID=? AND customerID=? ";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, where, function (err, rows) {
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
    remove_retouraddress: function(data,callback){
        if(data.addressID == undefined || data.addressID == ""){
            var err ={userFeedback: 'Address is missing'};
            return callback(err,null);
        }
        if(data.customerID == undefined || data.customerID == ""){
            var err ={userFeedback: 'Customer is missing'};
            return callback(err,null);
        }

        var where = [
            data.addressID,data.customerID
        ];

        var query = "DELETE FROM customers_retour WHERE id=? AND customerID=? ";
        pool.getConnection(function (err, connection) {
            var sql = connection.query(query, where, function (err, rows) {
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
    getRetouraddress: function(colname,value,options,callback){
        var clean_value = value;
        var queryValues = [];
        var where_additional = "";
        var where_additional_val = [];
        if(options && options.filter){
            for(var key in options.filter){
                where_additional = " and " + key + "=? ";
                where_additional_val.push(options.filter[key]);
            }
        }
        switch(colname){
            case "city":
                clean_value = "%"+value+"%";
                if(options){
                    if(options.unique){
                        clean_value = value;
                    }
                }
                var query = 'select ';
                queryValues.push(clean_value);
                break;
            case "customerID":
                var query = 'select customers_retour.*,customers.name as customer_name ' +
                    'from customers_retour ' +
                    'LEFT JOIN customers ON customers.id = customers_retour.customerID ' +
                    'WHERE customers.id = ? '+ where_additional;
                queryValues.push(value);
                for(var i=0;i<where_additional_val.length;i++){
                    queryValues.push(where_additional_val[i]);
                }
                break;
            default:
                var query = 'select customers_retour.* ' +
                    'from customers_retour ';
                break;
        }
        pool.getConnection(function (err, connection) {
            if(err){return callback(err,null);}
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
    }
};