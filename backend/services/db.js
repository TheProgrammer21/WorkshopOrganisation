const mariadb = require('mariadb');
const utils = require('./utils');

var dbPort = process.env.dbPort || 3306;
var dbUser = process.env.dbUser || "root";
var dbPassword = process.env.dbPassword || "maria";

const pool = mariadb.createPool({ host: "localhost", port: dbPort, user: dbUser, password: dbPassword, connectionLimit: 50, database: "workshop" });

function getConnection() {
    return pool.getConnection();
}

function createInString(arr) { // returns SQL query string: "(?, ?, ?, ?)"
    return "(" + "?, ".repeat(arr.length).slice(0, -2) + ")";
}

function query(res, queryString, params, result) {
    pool.getConnection().then(conn => {
        conn.query(queryString, params)
            .then(rows => {
                result(rows);
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}
module.exports = {
    getConnection: getConnection,
    createInString: createInString,
    query: query
}