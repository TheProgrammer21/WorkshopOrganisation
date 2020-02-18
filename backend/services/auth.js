var fs = require('fs');
var jwt = require('jsonwebtoken');
var db = require('./db');
var utils = require('./utils');

var secret = fs.readFileSync('./config/private.key');

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // auth with ldap

    var token = jwt.sign({ username: username }, secret, { algorithm: 'HS256', expiresIn: "10h" });

    utils.respondSuccess({ username: username, accessToken: token }, res);
}

function isLoggedIn(req, res, next) {
    let token = req.get('Authorization');

    token = token.split(' ')[1]; //remove the Bearer word at the beginning

    try {
        let body = jwt.verify(token, secret);

        //body can be used

        utils.respondSuccess(undefined, res); //later call next()
    } catch (err) {
        utils.respondError("Unauthorized", res, 401);
    }
}

module.exports = {
    login: login,
    isLoggedIn: isLoggedIn
};