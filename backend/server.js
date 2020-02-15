const express = require('express');
const helmet = require('helmet');
const mariadb = require('mariadb');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use((err, req, res, next) => respondError("Invalid JSON format", res, 400));

var dbPort = process.env.dbPort || 3306
var dbUser = process.env.dbUser || "root"
var dbPassword = process.env.dbPassword || "maria"
var backendPort = process.env.backendPort || 8085

const pool = mariadb.createPool({ host: "localhost", port: dbPort, user: dbUser, password: dbPassword, connectionLimit: 50, database: "workshop" });

function respondError(err, res, code = 500) {
    res.status(code);
    if (typeof err != "string") { // internal error
        console.log(err);
        res.send({ err: "Internal Server error" });
        return;
    } else {
        res.send({ err: err });
    }
}

function respondSuccess(res, obj = undefined, code = 200) {
    res.status(code);
    if (obj === undefined) {
        res.send();
    } else {
        res.send(obj);
    }
}


function isNumber(num) {
    return !isNaN(parseFloat(num)) && !isNaN(num);
}

function isSpecified(value) {
    return value !== undefined && value !== null;
}


function createObligatoryUnit(req, res) {
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.startDate);
    let name = req.body.name;
    let description = req.body.description;
    let status = req.body.status;

    if (!isSpecified(startDate) || !isSpecified(endDate) || !isSpecified(name) || !isSpecified(description) || !isNumber(status)) {
        respondError("Invalid body format", res, 400);
    } else if (name.length > 64 || description.length > 512) {
        respondError("Name or description too long", res, 400);
    } else if (parseInt(status) < 0 || parseInt(status) > 2) {
        respondError("Invalid status code", res, 400);
    }

    pool.getConnection().then(conn => {
        conn.query("INSERT INTO obligatoryUnit (startDate, endDate, name, description, status) VALUES (?, ?, ?, ?, ?);", [startDate, endDate, name, description, status])
            .then(rows => {
                respondSuccess(res, { id: rows.insertId }, 201);
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res));
}

app.post('/api/obligatoryunit', (req, res) => {
    createObligatoryUnit(req, res);
});

app.listen(backendPort, () => console.log("Server started on port " + backendPort));