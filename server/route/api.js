/**
 * Created by Chris on 10.11.16.
 */



var DB = require('../lib/db.js');
var Auth = require('../lib/auth.js');
var User = require('../lib/user.js');
var Team = require('../lib/team.js');
var mail = require('../lib/mail.js');
var Customer = require('../lib/customer.js');
var Data = require('../lib/dataCollector.js');
var Order = require('../lib/order.js');

var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })
var pool = DB.getPool();


global_user = {};
// we are here: /api


function getToken(req,cb) {
    if(typeof req.headers["authorization"] == "undefined"){
        cb(true,false);
    }
    var bearer = req.headers["authorization"].split(" ");
    if(bearer[1] != null) {
        Auth.verifyToken(bearer[1], function (err,bearertoken) {
            if (bearertoken!= null && bearertoken != false) {
                Auth.getTokenObj(bearertoken,function(err,userObj){
                    cb(false,userObj);
                })
            }else{
                cb(true,false);
            }
        });
    }
}
function ensureAuthorized(req, res, next) {
    console.log("Headers:")
    //console.log(req.headers)
    if(typeof req.headers["authorization"] == "undefined"){
        res.status(403).json({
            error: "header not found"
        });
        return false;
    }
    var bearer = req.headers["authorization"].split(" ");
    if(bearer[1] != null) {
        Auth.verifyToken(bearer[1], function (err,bearertoken) {
            if(err){
                res.status(403).json({
                    error: "validation error",
                    err: err
                });
            }else if (bearertoken!= null && bearertoken != false) {
                req.token = bearertoken;
                Auth.getTokenObj(bearertoken,function(err,userdata) {
                    if (err) {
                        res.status(401).json({
                            error: "getToken error",
                            err: err
                        });
                    }
                    if (userdata != null) {
                        console.log("userdata:")
                        //console.log(userdata)
                        req.user = userdata;
                        global_user = userdata
                        next();
                    }
                });
            } else {
                res.status(401).json({
                    error: "Token not found",
                    err: err
                });
            }
        });
    } else {
        res.status(403).json({
            error: "header after split not found"
        });
    }
}

function cleanInput(inputval,toLowerCase){
    var clean = "";
    var sandbox = inputval;
    if(toLowerCase != null){
        sandbox = sandbox.toLowerCase();
    }
    var clean = sandbox;
    return clean;

}

module.exports = function (app, express, io) {
    var router = express.Router();
    router.get('/user', function(req, res, next){
        res.send("/user")
    });

    router.get('/user/all', function(req, res, next){
        var query = 'select * from user';
        pool.getConnection(function (err, connection) {
            connection.query(query, function (err, rows) {
                connection.release();
                res.json({type: "success", code: 200, data: rows});
            });
        });
    });

    
    router.post('/user/signup', function(req,res,next){
        var data = req.body;
        var passObj = Auth.saltHashPassword(data.password);
        var user = {
            username: data.username,
            email : cleanInput(data.email,true),
            password: passObj.passwordHash,
            salt: passObj.salt,
            roles: new Array("User").join(",")
        };
        pool.getConnection(function (err, connection) {
            if (err){
                connection.release();
                var error = err;
                error.debug = err.message;
                res.status(420).json(error);
                return false;
            }

            connection.query('INSERT INTO user SET ?', user, function (err, result) {
                connection.release();
                if (err){
                    var error = err;
                    error.debug = err.message;
                    res.status(420).json(error);
                }else{
                    mail.sendMail({
                        body:{
                            mailHeader:{
                                to:data.email,
                                subject:'Ciao '+data.username
                            },
                            mailBody:{
                                content:{username: data.username}
                            }
                        },
                        templateurl:{
                            directory:'login'
                        }
                    });

                    res.json({data: result, userFeedback: "Signup successful", type: "success"});
                }



            });
        });
    });
    router.get('/user/passwordication',function(req,res){
        var data = req.query;
        User.get('id', data.userID, function(err,userdata){
            if(err){
                res.status(401).json({
                    error: "Username not found"
                });
            }
            if (userdata != null) {
                if (Auth.comparePassword(data.password, userdata[0].salt, userdata[0].password)) {
                    res.status(200).json({
                        user: userdata
                    });
                }else{
                    res.status(200).json({
                        error: {password: true}
                    });
                }
            }
        });
    });
    router.post('/user/signin', function(req, res, next){

        var data = req.body;
        User.get('username',data.username,function(err,userdata) {
            if(err){
                res.status(401).json({
                    error: "Username not found"
                });
            }
            userdata = userdata[0];
            if (userdata != null) {
                var user = {
                    id: userdata.id,
                    username: userdata.username,
                    email: userdata.email,
                    roles: userdata.roles.split(","),
                    login: userdata.login
                }

                if (Auth.comparePassword(data.password, userdata.salt, userdata.password)) {
                    var token = Auth.createUserToken(user);
                    User.updateToken(user.id,token,function(result,err){
                        if(err){
                            res.status(500).json({
                                error: err
                            });
                        }
                        user.token = token;
                        if (result != null) {
                            res.json({user: user, userFeedback: "Login erfolgreich", type:"success"});
                        }

                    });

                } else {
                    res.status(200).json({
                        error: {password: true}
                    });
                }
            } else {
                res.status(200).json({
                    error: {username: true}
                });
            }
        });
    });

    router.put("/team/user",ensureAuthorized,function(req,res,next){
        console.log("TeamIDs:")
        console.log(req.body.ids)

        var errors = [];
        var counter=0;
        for(var x=0;x<req.body.ids.length;x++){
            Team.join(req.body.ids[x],req.user.id,req.body.roleID,function(err,result){
                counter++;
                if(err){
                    errors.push(err);
                }
                if(counter==req.body.ids.length){
                    if(errors.length>0){
                        res.status(420).json(errors[0]);
                        return;
                    }else{
                        res.json({ userFeedback: "Team beigetreten", type:"success"});
                        return;
                    }
                }
            });
        }



    });


    router.get('/team/name/:name',ensureAuthorized, function(req,res){
        console.log("get Team by name")
        Team.get('name',req.params.name,{}, function(err,teams){
            if(err){
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }else if(teams){
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
    router.get('/team/id/:id',ensureAuthorized, function(req,res){
        console.log("get Team by id")
        console.log(req.params)
        Team.get('id',req.params.id,{}, function(err,teams){
            if(err){
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }else if(teams){
                console.log("teams:");
                console.log(teams)
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
    router.get('/team/userCreate/:id',ensureAuthorized, function(req,res){
        Team.get('userCreate',req.params.id,{}, function(err,teams){
            if(err){
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }
            if(teams){
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
    router.get('/team/user/:id',ensureAuthorized, function(req,res){
        Team.get('user',req.params.id,{}, function(err,teams){
            if(err){
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }
            if(teams){
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
    router.get('/team/users/teamID/:teamid',ensureAuthorized, function(req,res){
        User.get('team',req.params.teamid, function(err,teams){
            if(err) {
                console.log(err)
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }else if(teams){
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
/* CLEAN API */

// /User
    router.get('/user/id/:userid', function(req, res, next){
        User.get('id',req.params.userid,function(err,userdata) {
            if (err){
                var error = err;
                error.debug = "Error getting data by username";
                res.status(420).json(error);
            }
            if (userdata != null) {
                var user = userdata;

                res.json({
                    user: user
                });
            }
        });
    });
    router.get('/user/username/:username', function(req, res, next){
        User.get('username',req.params.username,function(err,userdata) {
            if (err){
                var error = err;
                error.debug = "Error getting data by username";
                res.status(420).json(error);
            }
            if (userdata != null) {
                var user = {
                    id: userdata.id,
                    username: userdata.username,
                    email: userdata.email,
                    roles: userdata.roles.split(",")
                };
                res.json({
                    user: user
                });
            }
        });
    });


    router.get('/user/email/:email', function(req, res, next){
        User.get('email',cleanInput(req.params.email,true),function(err,userdata) {
            if (err){
                var error = err;
                error.debug = "Error getting data by email";
                res.status(420).json(error);
            }
            if (userdata[0] != null) {

                var user = {
                    id: userdata[0].id,
                    username: userdata[0].username,
                    email: userdata[0].email,
                    roles: userdata[0].roles.split(",")
                };
                res.json({
                    user: user
                });
            }
        });
    });
    router.get('/user/token/:token', function(req, res, next){
        console.log("---");
        console.log("Token:")
        //console.log(req.params.token)
        if(req.params.token != "undefined"){
            Auth.getTokenObj(req.params.token,function(err,userdata) {
                if (err) {
                    res.status(401).json({
                        error: "Token not found",
                        err: err
                    });
                }
                if (userdata != null) {
                    global_user = userdata
                    res.json({
                        user: userdata
                    });
                }
            });
        }else{
            res.status(420).json({
                error: {debug: "Nicht eingeloggt"}
            });
        }
    });
    router.put("/user/:userid",function(req,res,next){
        if(req.params.userid != "undefined"){
            console.log(req.body);
            if(req.body.password != undefined) {
                var passObj = Auth.saltHashPassword(req.body.password);
                req.body.password = passObj.passwordHash;
                req.body.salt = passObj.salt;
            }

            User.put(req.params.userid, req.body, function(err,result){
                if(err){
                    err.debug = err.message
                    res.status(500).json({
                        error: err
                    });
                }
                if (result != null) {
                    res.json({userFeedback: "Daten bearbeitet", type: "success",data: result});
                }
            });
        }else{
            res.status(420).json({
                error: {debug: "User unknown"}
            });
        }
    });
    // /User/Authentification
    router.get('/user/authentication/:token', function(req, res, next){
        if(req.params.token != "undefined"){
            Auth.verifyToken(req.params.token,function(err,userdata) {

                if (err) {
                    res.status(401).json({
                        error: "Token not found"
                    });
                }
                if (userdata != null) {
                    res.json({
                        token: userdata
                    });
                }
            });
        }else{
            res.status(420).json({
                error: {debug: "Nicht eingeloggt"}
            });
        }

    });
    router.put('/user/authentication/:token', function(req, res, next){
        if(req.params.token != "undefined"){
            try{
                var token = Auth.refreshToken(req.params.token);
                res.json({
                    token: token
                });
            }catch(e){
                console.log("e:" + e);
            }
        }else{
            res.status(420).json({
                error: {debug: "Nicht eingeloggt"}
            });
        }


    });


    // Users
    router.get('/users/is/:colname', function(req, res){
        User.get(req.params.colname,1,function(err,userdata) {
            if (err){
                var error = err;
                error.debug = "Error getting data by username";
                res.status(420).json(error);
            }
            if (userdata != null) {
                res.json(userdata);
            }else{
                res.json([])
            }
        });
    });
    // /Team
    router.delete("/team",ensureAuthorized,function(req,res,next){
        if(typeof req.query.ids != "object"){
            req.query.ids = [req.query.ids];
        }
        var errors = [];
        var counter=0;
        for(var x=0;x<req.query.ids.length;x++){
            Team.delete(req.query.ids[x],function(err,result){
                counter++;
                if(err){
                    errors.push(err);
                }
                if(counter==req.query.ids.length){
                    if(errors.length>0){
                        res.status(420).json(errors[0]);
                        return;
                    }else{
                        res.json({ userFeedback: "Team gelöscht", type:"success"});
                        return;
                    }
                }
            });
        }
    });
    router.post("/team",ensureAuthorized,function(req,res,next){
        if (req.query.teamname != "undefined") {
            if(req.params.token != "undefined"){


                        Team.get('name', req.query.teamname,{unique:true}, function (err, teams) {
                            if (err) {
                                err.debug = err.message
                                res.status(500).json({
                                    error: err
                                });
                            } else if (teams == null) {
                                req.query.userCreate = global_user.id;
                                Team.post(req.query, function (err, data) {
                                    if (data) {
                                        upload.single('file')(req,res,function(err) {
                                            res.json({userFeedback: "Team erstellt", type: "success",data: data});
                                        });
                                    } else {
                                        res.status(500).json({
                                            error: err
                                        });
                                    }
                                });
                            } else {
                                res.status(420).json({

                                    debug: "Teamname bereits vergeben"
                                });
                            }
                            var reqBody = {};

                    });
            }
        } else {
            res.status(420).json({
                error: {debug: "Teamdata missing"}
            });
        }
    });
    router.put("/team",ensureAuthorized,function(req,res,next){
        if (req.query.teamname != "undefined") {
            if(req.params.token != "undefined"){


                Team.get('name', req.query.teamname,{unique:true}, function (err, teams) {
                    if (err) {
                        err.debug = err.message
                        res.status(500).json({
                            error: err
                        });

                    } else if (teams == null || (teams.id == req.query.teamid)) {
                        if(!req.query.userCreate){
                            req.query.userCreate = global_user.id;
                        }

                        Team.post(req.query, function (err, data) {
                            if (data) {
                                upload.single('file')(req,res,function(err) {
                                    res.json({userFeedback: "Team bearbeitet", type: "success",data: data});
                                });
                            } else {
                                res.status(500).json({
                                    error: err
                                });
                            }
                        });
                    } else {
                        res.status(420).json({

                            debug: "Teamname bereits vergeben"
                        });
                    }


                });
            }
        } else {
            res.status(420).json({
                error: {debug: "Teamdata missing"}
            });
        }
    });
    router.get('/team/roles',ensureAuthorized, function(req,res){
        Team.static_roles(function(err,teams){
            if(err) {
                console.log(err);
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(teams){
                res.json(teams);
            }else{
                res.json({})
            }
        });

    });
    router.delete("/team/:teamid/user/:userid",ensureAuthorized,function(req,res){

            Team.leave(req.params.teamid,req.params.userid,function(err,result){
                if(err){
                    res.status(420).json(errors[0]);

                }else{
                    res.json({ userFeedback: "Nutzer aus Team entfernt", type:"success"});

                }
            });
    });
    router.put('/team/:teamid/user/:userid',ensureAuthorized,function(req,res){
        Team.join(req.params.teamid,req.params.userid,req.body.roleID,function(err,result){
            if(err){
                console.log(err);
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(result){
                res.json({ userFeedback: "Rolle geändert", type:"success"});
            }
        });
    });
    router.put('/team/:teamid/post/',ensureAuthorized,function(req,res){

        Team.sendMessage(req.user.id,req.params.teamid,req.body.params,function(err,result){
            if(err){
                console.log(err);
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(result){
                res.json({ userFeedback: "Nachricht gesendet", type:"success"});
                console.log("can u see it?");
                io.userSocket[req.user.id].broadcast.emit('message_receive', {teamID: req.params.teamid, title: req.body.params.title});
            }
        });
    });

    router.delete('/team/:teamid/post/:postid',ensureAuthorized,function(req,res){

        Team.deleteMessage(req.user.id,req.params.teamid,req.params.postid,function(err,result){
            if(err){
                console.log(err);
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(result){
                res.json({ userFeedback: "Nachricht gelöscht", type:"success"});
                console.log("can u see it?");
                //io.userSocket[req.user.id].broadcast.emit('message_receive', {teamID: req.params.teamid, title: req.body.params.title});
            }
        });
    });


    // NEWS

    router.get('/team/:teamid/news/',ensureAuthorized, function(req,res){
        Team.getNews(req.params.teamid, function(err,news){
            if(err) {
                console.log("1 " + err);
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(news){
                User.newsRead(req.user.id, function(err,result){
                    if(err) {
                        console.log("2 " + err);
                        err.debug = err.message;
                        res.status(500).json({
                            error: err
                        });
                    }else{
                        res.json(news);
                    }

                });

            }else{
                res.json({});
            }
        });


    });

    // CUSTOMERS

    router.get('/customer/',ensureAuthorized, function(req,res){
        Customer.get(null,null,null, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.get('/customer/name/:name',ensureAuthorized, function(req,res){
        Customer.get("name",req.params.name,null, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.get('/customer/id/:id',ensureAuthorized, function(req,res){
        Customer.get("id",req.params.id,null, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.get('/customer/retouraddress/customerID/:customerID',ensureAuthorized, function(req,res){
        var options = {};
        if(req.query){
            if(req.query.filter){
                    options.filter = JSON.parse(req.query.filter);
            }
        }

        Customer.getRetouraddress("customerID",req.params.customerID,options, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.post('/customer/',ensureAuthorized, function(req,res){
        if (req.body.name != "undefined") {
            Customer.post(req.body, function(err,data){
                if(err) {
                    err.debug = err.message;
                    res.status(500).json({
                        error: err
                    });
                }else if(data && data.id){
                    req.body.users.map(function(elem){
                        var insert_data = {
                            customerID: data.id,
                            userID: elem.id
                        };
                        Customer.post_keyaccount(insert_data,function(err,data){
                            if(err) {
                                err.debug = err.message;
                                res.status(500).json({
                                    error: err
                                });
                            }
                        })
                    });
                    res.json({ userFeedback: "Kunde angelegt", type:"success", customer: {id: data.id, name:req.body.name } });
                }else{
                    var response = {};
                    response.debug = "Kunde existiert bereits";
                    res.status(420).json(response);
                }
            });
        }
    });
    router.post('/customer/keyaccount', ensureAuthorized, function(req,res){
        var usercount = 0;
        if(!req.body.userIDs){
            return false;
        }
        usercount = req.body.userIDs.length;
        if(usercount<1){
            return false;
        }
        var counter=0;
        req.body.userIDs.map( function(user){

            var insert_data = {
                customerID: req.body.customerID,
                userID: user
            };
            Customer.post_keyaccount(insert_data,function(err,data){
                counter++;
                if(err) {
                    err.debug = err.message;
                    res.status(500).json({error: err});
                }
                if(data) {
                    if (counter == usercount) {
                        res.json({userFeedback: "KeyAccount angelegt", type: "success", customer: {}});
                    }
                }
            });
        });
    });
    router.post('/customer/retouraddress', ensureAuthorized, function(req,res){
        if(!req.body.customerID || !req.body.city){
            var response = {};
            response.debug = "Bitte alle Felder ausfüllen";
            res.status(420).json(response);
            return;
        }

        var insert_data = {
            customerID: req.body.customerID,
            street: req.body.street,
            postal: req.body.postal,
            city: req.body.city,
            person: req.body.person,
            comment: req.body.comment,
            active: req.body.active,
        };

        if(req.body.id){
            var id = req.body.id;
            Customer.update_retouraddress({action: 'deactivate', data: {id:id} },function(err,data){
                if(err) {
                    err.debug = err.message;
                    res.status(500).json({error: err});
                }
                if(data) {
                    Customer.post_retouraddress(insert_data,function(err,data){
                        if(err) {
                            err.debug = err.message;
                            res.status(500).json({error: err});
                        }
                        if(data) {
                            res.json({userFeedback: "Retouradresse aktualisiert", type: "success", addressID: data.id});
                        }
                    });
                }
            });
        }else{
            Customer.post_retouraddress(insert_data,function(err,data){
                console.log(data)
                if(err) {
                    err.debug = err.message;
                    res.status(500).json({error: err});
                }
                if(data) {
                    res.json({userFeedback: "Retouradresse angelegt", type: "success", addressID: data.id});
                }
            });
        }
    });
    router.post('/customer/retouraddress/state', ensureAuthorized, function(req,res){
        console.log(req.body)
        if(!req.body.addressID || typeof req.body.active == 'undefined'){
            var response = {};
            response.debug = "Bitte alle Felder ausfüllen";
            res.status(420).json(response);
            return;
        }

        switch(req.body.active){
            case 1:
                console.log("eins")
                Customer.update_retouraddress({action: 'activate',id:req.body.addressID} ,function(err,data){
                    if(err) {
                        err.debug = err.message;
                        res.status(500).json({error: err});
                    }
                    if(data) {
                       res.json({userFeedback: "Retouradresse aktiviert", type: "success"});
                    }
                });
                break;
            case 0:
                console.log("null")
                Customer.update_retouraddress({action: 'deactivate', id:req.body.addressID },function(err,data){
                    if(err) {
                        err.debug = err.message;
                        res.status(500).json({error: err});
                    }
                    if(data) {

                            res.json({userFeedback: "Retouradresse deaktiviert", type: "success"});

                    }
                });
                break;

        }

    });

    router.delete('/customer/retouraddress/',ensureAuthorized, function(req,res){
        Customer.remove_retouraddress({customerID: req.query.customerid,addressID:req.query.addressid},function(err,result){
            if(err){
                res.status(420).json(errors[0]);
            }else{
                res.json({ userFeedback: "Retouradresse entfernt", type:"success"});
            }
        });
    });
    router.delete('/customer/keyaccount/',ensureAuthorized, function(req,res){
        Customer.remove_keyaccount({customerID: req.query.customerid,userID:req.query.userid},function(err,result){
            if(err){
                res.status(420).json(errors[0]);
            }else{
                res.json({ userFeedback: "KeyAccount entfernt", type:"success"});
            }
        });
    });

    router.get('/data/articlegender',ensureAuthorized, function(req,res){
        Data.articlegender(function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.get('/data/articlewg',ensureAuthorized, function(req,res){
        Data.articlewg(function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });

    router.get('/order/latest/:count',ensureAuthorized, function(req,res){
        Order.get({latest:req.params.count}, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json(data);
            }else{

                res.json([])
            }
        });
    });
    router.post('/order',ensureAuthorized, function(req, res){
        console.log(req.body);
        req.body.userID = global_user.id;
        Order.post_new(req.body, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json({ userFeedback: "Auftrag erstellt", type:"success", id:data.id});
            }else{

                res.json([])
            }

        });
    });
    router.post('/order/keyaccount',ensureAuthorized, function(req, res){
        console.log(req.body);

        Order.post_keyaccount(req.body, function(err,data){
            if(err) {
                console.log(err)
                err.debug = err.message;
                res.status(500).json({
                    error: err
                });
            }else if(data){
                res.json({ userFeedback: "Nutzer zugewiesen", type:"success", id:data.id});
            }else{

                res.json([])
            }

        });
    });

    router.get('/protected', ensureAuthorized, function(req,res){
        res.send("da shit!");
    });

    router.get('/*', function(req, res){
        res.send("/")

    });
    return router;
};