//'use strict'
var cluster = require('cluster');
if (cluster.isMaster) {
    var i = 0;
    for (i; i< 4; i++){
        cluster.fork();
    }
    //if the worker dies, restart it.
    cluster.on('exit', function(worker){
        console.log('Worker ' + worker.id + ' died..');
        cluster.fork();
    });
}
else {
    var express = require("express");
    var bodyParser = require("body-parser");


    var helmut = require('helmet')

    var path = require('path');

    var port = 3000;

    var app = express();
    var server = require('http').Server(app);

    var io = require('socket.io')(server);
    var ioEvents = require('./lib/ioevents.js')(io);

    app.use(helmut());

    app.use(express.static(path.join(__dirname, '/../')));

//View Engine
//parent as rootfolder, now: /server/server.js
    app.set('views', path.join(__dirname, '/../'));
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);

// Body Parser MW
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });


    var api = require('./route/api')(app, express, io);
    var index = require('./route/index')(app, express);
    var main = require('./route/main')(app, express);
    app.use('/api', api);
    app.use('/server', main);
    app.use('/public', index);
    app.use('/protected', index);


    server.listen(port, function () {
        console.log('Server started on port ' + port);
    });

    process.on('uncaughtException', function () {
        console.log(err);
        //Send some notification about the error
        process.exit(1);
    });
}


