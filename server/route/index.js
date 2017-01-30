/**
 * Created by Chris on 10.11.16.
 */
module.exports = function (app, express) {
    var router = express.Router();

    // we are here: /
    router.get('*', function (req, res, next) {
        console.log("index")
        res.render('client/index.html');
    });

    return router;
}