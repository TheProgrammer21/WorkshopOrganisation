const mariadb = require('mariadb');

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

module.exports = {
    getConnection: getConnection,
    createInString: createInString
}