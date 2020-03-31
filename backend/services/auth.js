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

function isAdmin(req, res, next) {
    if (req.user !== undefined && req.permissions === 1) {
        next();
    } else {
        utils.respondError("Unauthorized", res, 401);
    }
}

function loggedIn(req, res, next) {
    if (req.user !== undefined && req.permissions !== undefined) {
        next();
    } else {
        utils.respondError("Unauthorized", res, 401);
    }
}

function identify(req, res, next) {
    let token = req.get('Authorization') || ""; // that split doesn't fail in next line
    req.user = undefined;
    req.permissions = undefined;

    token = token.split(' ')[1]; //remove the Bearer word at the beginning

    if (token === undefined) { // Bearer at the beginning is missing
        next();
        return;
    }

    // a token has been passed: check validity
    try {
        let body = jwt.verify(token, secret, { algorithms: ["HS256"] });

        req.user = body.username; // set username

        db.getConnection().then(conn => {
            conn.query("SELECT permissions FROM user WHERE username = ?;", [body.username])
                .then(rows => {
                    if (rows.length === 0) { // username doesn't exist
                        req.user = undefined;
                        req.permissions = undefined;
                        next();
                    } else { // set the permission on the req object
                        req.permissions = rows[0].permissions;
                        next();
                    }
                }).catch(err => utils.respondError(err, res))
                .finally(() => conn.release());
        }).catch(err => utils.respondError(err, res));
    } catch (err) { // not logged in because of a problem with the token
        next();
    }
}

function translatePermission(permission) { // translates number into string
    switch (permission) {
        case 0: return "student";
        case 1: return "admin";
        default: return undefined;
    }
}

module.exports = {
    login: login,
    identify: identify,
    loggedIn: loggedIn,
    isAdmin: isAdmin,
    translatePermission: translatePermission
};