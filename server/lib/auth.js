/**
 * Created by Chris on 14.11.16.
 */
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var secretKey = "123";
var lifetime_minutes = 60*600;
function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
}
function sha512(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

module.exports = {
    createUserToken: function(obj){
        var user = {
            id: obj.id,
            username: obj.username,
            email: obj.email,
            roles: obj.roles,
            teams: obj.teams,
            login: obj.login
        };
        return jwt.sign(user, secretKey, { expiresIn: lifetime_minutes });
    },
    saltHashPassword : function(string_password) {
        var salt = genRandomString(12); /** Gives us salt of length 16 */
        var passwordData = sha512(string_password, salt);
        return passwordData;
    },

    comparePassword : function(string_password, string_salt, string_hash){
        if(string_password == null){
            return false;
        }
        var passwordData = sha512(string_password, string_salt);

        if(passwordData.passwordHash == string_hash){
            return true;
        }
        return false;
    },
    verifyToken: function(token,callback){
        jwt.verify(token, secretKey,function(err,result){
            if(err){
                console.log("verifyToken: "+err.message)
                callback(err,null);
            }
            if(result != null){
                callback(null,token);
            }
        });
    },
    getTokenObj: function(token,callback){
        jwt.verify(token, secretKey,function(err,result){
            if(err){
                console.log("getTokenObj: "+err.message)
                callback(err,null);
            }
            if(result != null){
                callback(null,result);
            }
        });
    },
    refreshToken: function(token){
        var profile = jwt.verify(token, secretKey);
        if(profile.exp){
            delete profile.exp;
            delete profile.iat;
        }
        // issue a new token
        var refreshed_token = jwt.sign(profile, secretKey, { expiresIn: lifetime_minutes });
       return refreshed_token;
    }
};