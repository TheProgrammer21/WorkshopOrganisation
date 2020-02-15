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

function respondSuccess(obj = undefined, res, code = 200) {
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
        return;
    } else if (name.length > 64 || description.length > 512) {
        respondError("Name or description too long", res, 400);
        return;
    } else if (parseInt(status) < 0 || parseInt(status) > 3) {
        respondError("Invalid status code", res, 400);
        return;
    }

    pool.getConnection().then(conn => {
        conn.query("INSERT INTO obligatoryUnit (startDate, endDate, name, description, status) VALUES (?, ?, ?, ?, ?);", [startDate, endDate, name, description, status])
            .then(rows => {
                respondSuccess({ id: rows.insertId }, res, 201);
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res));
}

function updateObligatoryUnit(req, res) {
    let id = req.params.id;
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.startDate);
    let name = req.body.name;
    let description = req.body.description;
    let status = req.body.status;

    if (!isNumber(id)) {
        respondError("Invalid id", res, 400);
        return;
    } else if (!isSpecified(startDate) || !isSpecified(endDate) || !isSpecified(name) || !isSpecified(description) || !isNumber(status)) {
        respondError("Invalid body format", res, 400);
        return;
    } else if (name.length > 64 || description.length > 512) {
        respondError("Name or description too long", res, 400);
        return;
    } else if (parseInt(status) < 0 || parseInt(status) > 3) {
        respondError("Invalid status code", res, 400);
        return;
    }

    pool.getConnection().then(conn => {
        conn.query("UPDATE obligatoryUnit SET startDate = ?, endDate = ?, name = ?, description = ?, status = ? WHERE id = ?;", [startDate, endDate, name, description, status, id])
            .then(rows => {
                if (rows.effectedRows == 0) {
                    respondError("Obligatory Unit not found", res, 404);
                } else {
                    respondSuccess({ id: id }, res, 201);
                }
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res));
}

function getObligatoryUnit(req, res) {
    id = req.params.id;

    if (!isNumber(id)) {
        respondError("Invalid id", res, 400);
        return;
    }

    pool.getConnection().then(conn => {
        conn.query("SELECT * FROM obligatoryUnit WHERE id = ?;", [id])
            .then(rows => {
                if (rows.length == 0) {
                    respondError("Not found", res, 404);
                } else {
                    respondSuccess(rows[0], res)
                }
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res));
}

function getAllObligatoryUnits(req, res) {
    let status = req.query.status; // can be filtered by status

    if (status != undefined) {
        if (!isNumber(status)) {
            respondError("Invalid status filter", res, 400);
            return;
        }
    }

    pool.getConnection().then(conn => {
        let result;
        conn.query("SELECT * FROM obligatoryUnit" +
            (status === undefined ? ";" : " WHERE status = ?;"),
            (status === undefined ? [] : [status]))
            .then(rows => {
                respondSuccess(rows, res);
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res));
}

function deleteObligatoryUnit(req, res) {
    let id = req.params.id;

    if (!isNumber(id)) {
        respondError("Invalid id", res, 400);
        return;
    }

    pool.getConnection().then(conn => {
        conn.query("CALL deleteObligatoryUnit(?);", [id])
            .then(rows => {
                if (rows.affectedRows === 0) {
                    respondError("Not found", res, 404);
                } else {
                    respondSuccess(undefined, res);
                }
            }).catch(err => respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => respondError(err, res))
}

app.put('/api/obligatoryUnit/:id', (req, res) => {
    updateObligatoryUnit(req, res);
});

app.get('/api/obligatoryUnit/:id', (req, res) => {
    getObligatoryUnit(req, res);
});

app.delete('/api/obligatoryUnit/:id', (req, res) => {
    deleteObligatoryUnit(req, res);
});

app.get('/api/allObligatoryUnits', (req, res) => {
    getAllObligatoryUnits(req, res);
});

app.post('/api/obligatoryUnit', (req, res) => {
    createObligatoryUnit(req, res);
});

app.listen(backendPort, () => console.log("Server started on port " + backendPort));