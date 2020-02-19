var fs = require('fs');
var jwt = require('jsonwebtoken');
var db = require('./db');
var utils = require('./utils');

var secret = fs.readFileSync('./config/private.key');
var tokenExpirationTime = "10h";

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (!utils.isSpecified(username) || !utils.isSpecified(password)) {
        utils.respondError("Missing parameters", res, 400);
        return;
    }

    // Todo: auth with ldap

    var token = jwt.sign({ username: username }, secret, { algorithm: 'HS256', expiresIn: tokenExpirationTime });

    utils.respondSuccess({ username: username, accessToken: token }, res);
}

function renewToken(req, res) {
    let token = req.get('Authorization') || "";

    token = token.split(" ")[1];

    if (token === undefined) {
        utils.respondError("Unauthorized", res, 401);
        return;
    }

    try {
        let body = jwt.verify(token, secret, { algorithms: ["HS256"] });
        let newToken = jwt.sign({ username: body.username }, secret, { algorithm: 'HS256', expiresIn: tokenExpirationTime });
        utils.respondSuccess({ username: body.username, accessToken: newToken }, res);
    } catch (err) {
        console.log(err)
        utils.respondError("Unauthorized", res, 401);
    }
}

function loggedIn(req, res, next) {
    let token = req.get('Authorization') || ""; // that split doesn't fail in next line

    token = token.split(' ')[1]; //remove the Bearer word at the beginning

    if (token === undefined) { // Bearer at the beginning is missing
        utils.respondError("Unauthorized", res, 401);
        return;
    }

    try {
        let body = jwt.verify(token, secret, { algorithms: ["HS256"] });
        req.user = body.username;
        next();
    } catch (err) {
        utils.respondError("Unauthorized", res, 401);
    }
}

module.exports = {
    login: login,
    renewToken: renewToken,
    loggedIn: loggedIn
};