/**
 * Created by Chris on 10.11.16.
 */



var DB = require('../lib/db.js');
var Auth = require('../lib/auth.js');
var User = require('../lib/user.js');
var Team = require('../lib/team.js');
var mail = require('../lib/mail.js');
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
    console.log(req.headers)
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
                        console.log(userdata)
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

module.exports = function (app, express) {
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
                if (Auth.comparePassword(data.password, userdata.salt, userdata.password)) {
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
                    roles: userdata.roles.split(",")
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
            Team.join(req.body.ids[x],global_user.id,req.body.roleID,function(err,result){
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
    router.put("/user/:userid",function(req,res,next){
        if(req.params.userid != "undefined"){
            var reqBody = {};
            if(req.body.password != "undefined") {
                var passObj = Auth.saltHashPassword(req.body.password);
                reqBody.password = passObj.passwordHash;
                reqBody.salt = passObj.salt;
            }
            User.put(req.params.userid, reqBody, function(err,result){
                if(err){
                    err.debug = err.message
                    res.status(500).json({
                        error: err
                    });
                }

                if (result != null) {
                    res.send(reqBody);
                }
            });
        }else{
            res.status(420).json({
                error: {debug: "User unknown"}
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
    router.get('/user/token/:token', function(req, res, next){
        console.log("Token:" + req.params.token)
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
                    var reqBody = {};

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
    router.delete("/team/:teamid/user/:userid",ensureAuthorized,function(req,res,next){

            Team.leave(req.params.teamid,req.params.userid,function(err,result){
                if(err){
                    res.status(420).json(errors[0]);
                    return;
                }else{
                    res.json({ userFeedback: "Nutzer aus Team entfernt", type:"success"});
                    return;
                }
            });
    });
    router.put('/team/:teamid/user/:userid',ensureAuthorized,function(req,res,err){
        Team.join(req.params.teamid,req.params.userid,req.body.roleID,function(err,result){
            if(err){
                console.log(err)
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }else if(result){
                res.json({ userFeedback: "Rolle geändert", type:"success"});
                return;
            }
        });
    });
    router.get('/protected', ensureAuthorized, function(req,res,err){
        res.send("da shit!")
    });

    router.get('/*', function(req, res, next){
        res.send("/")

    });
    return router;
};