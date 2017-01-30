/**
 * Created by Chris on 10.11.16.
 */
var mail = require('../lib/mail.js');
var fs = require('fs');

module.exports = function (app, express) {
    var router = express.Router();
    // we are here: /
    router.post('/log',function(req, res, next){
        var content = req.body.data;
        var filename = "log/test.txt";
        fs.open(filename, 'a+', function(err, data){
            if (err) {
                res.status(500).json({
                    error: err
                });
            }
            fs.writeFile(filename, content, function(err) {
                if(err) {
                    res.status(500).json({
                        error: err
                    });
                }
                res.json({
                    data: true
                });
            });
        });
    });
    router.get('/', function (req, res, next) {
        res.send("");
    });
    router.post('/mail', function(req,res){
        console.log("mail");
    });
    router.post('/mail/send', function(req,res){
        mail.sendMail(req.body).then(
            function(response){
                res.send(true);
            },
            function(err){
                err.debug = err.message
                res.status(500).json({
                    error: err
                });
            }
        );
    });
    router.get("/files",function(req,res){
        console.log("files")
    });
    router.get("/files/dir",function(req,res){
        var files = [];

        fs.readdir(req.query.dirname, function(err, files){
            if(err) {
                res.status(500).json({
                    error: err
                });
            }
            files.forEach(function(file){
                files.push(file);
            });
            res.json({
                files: files
            });
        })
    });


    return router;
}