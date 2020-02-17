var db = require('../services/db.js');
var utils = require('../services/utils.js');

function createObligatoryUnit(req, res) {
    let startDate = new Date(Date.parse(req.body.startDate));
    let endDate = new Date(Date.parse(req.body.startDate));
    let name = req.body.name;
    let description = req.body.description;
    let status = req.body.status;

    if (!utils.isSpecified(name) || !utils.isSpecified(description) || !utils.isNumber(status)) {
        utils.respondError("Invalid body format", res, 400);
        return;
    } else if (startDate == "Invalid Date" || endDate == "Invalid Date") {
        utils.respondError("Invalid start or end date", res, 400);
        return;
    } else if (name.length > 64 || description.length > 512) {
        utils.respondError("Name or description too long", res, 400);
        return;
    } else if (parseInt(status) < 0 || parseInt(status) > 3) {
        utils.respondError("Invalid status code", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("INSERT INTO obligatoryUnit (startDate, endDate, name, description, status) VALUES (?, ?, ?, ?, ?);", [startDate, endDate, name, description, status])
            .then(rows => {
                utils.respondSuccess({ id: rows.insertId }, res, 201);
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function updateObligatoryUnit(req, res) {
    let id = req.params.id;
    let startDate = new Date(Date.parse(req.body.startDate));
    let endDate = new Date(Date.parse(req.body.startDate));
    let name = req.body.name;
    let description = req.body.description;
    let status = req.body.status;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    } else if (!utils.isSpecified(name) || !utils.isSpecified(description) || !utils.isNumber(status)) {
        utils.respondError("Invalid body format", res, 400);
        return;
    } else if (startDate == "Invalid Date" || endDate == "Invalid Date") {
        utils.respondError("Invalid start or end date", res, 400);
        return;
    } else if (name.length > 64 || description.length > 512) {
        utils.respondError("Name or description too long", res, 400);
        return;
    } else if (parseInt(status) < 0 || parseInt(status) > 3) {
        utils.respondError("Invalid status code", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("UPDATE obligatoryUnit SET startDate = ?, endDate = ?, name = ?, description = ?, status = ? WHERE id = ?;", [startDate, endDate, name, description, status, id])
            .then(rows => {
                if (rows.effectedRows == 0) {
                    utils.respondError("Obligatory Unit not found", res, 404);
                } else {
                    utils.respondSuccess({ id: id }, res, 201);
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function getObligatoryUnit(req, res) {
    id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("SELECT * FROM obligatoryUnit WHERE id = ?;", [id])
            .then(rows => {
                if (rows.length == 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    utils.respondSuccess(rows[0], res)
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function getAllObligatoryUnits(req, res) {
    let status = req.query.status; // can be filtered by status

    if (status != undefined) {
        if (!utils.isNumber(status)) {
            utils.respondError("Invalid status filter", res, 400);
            return;
        }
    }

    db.getConnection().then(conn => {
        let result;
        conn.query("SELECT * FROM obligatoryUnit" +
            (status === undefined ? ";" : " WHERE status = ?;"),
            (status === undefined ? [] : [status]))
            .then(rows => {
                utils.respondSuccess(rows, res);
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function deleteObligatoryUnit(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("CALL deleteObligatoryUnit(?);", [id])
            .then(rows => {
                if (rows.affectedRows === 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    utils.respondSuccess(undefined, res);
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function getAllWorkshopsForObligatoryUnit(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("SELECT w.id, w.name, w.description, w.startDate, w.duration, w.participants \
                    FROM obligatoryUnitWorkshop ow \
                    INNER JOIN workshop w ON ow.workshopId = w.id \
                    WHERE obligatoryUnitId = ?;", [id])
            .then(rows => {
                if (rows.length === 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    utils.respondSuccess(rows, res);
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function createWorkshop(req, res) {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let startDate = new Date(Date.parse(req.body.startDate));
    let duration = req.body.duration;
    let participants = req.body.participants;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    } if (!utils.isSpecified(name) || !utils.isSpecified(description)) {
        utils.respondError("Missing parameters", res, 400);
        return;
    } else if (!utils.isNumber(duration) || !utils.isNumber(participants)) {
        utils.respondError("Invalid format for duration or participants", res, 400);
        return;
    } else if (startDate == "Invalid Date") {
        utils.respondError("Invalid start date", res, 400);
        return;
    } else if (name.length > 65 || description.length > 512) {
        utils.respondError("Name or description too long", res, 400);
        return;
    } else if (duration <= 0) {
        utils.respondError("The duration must be greater than 0", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("INSERT INTO workshop (name, description, startDate, duration, participants) VALUES (?, ?, ?, ?, ?);", [name, description, startDate, duration, participants])
            .then(rows => {
                let wid = rows.insertId;
                conn.query("INSERT INTO obligatoryUnitWorkshop (obligatoryUnitId, workshopId) VALUES (?, ?);", [id, wid])
                    .then(rows => {
                        utils.respondSuccess({ id: wid }, res, 201);
                    }).catch(err => utils.respondError(err, res))
                    .finally(() => conn.release());
            }).catch(err => {
                utils.respondError(err, res);
                conn.release();
            });
    }).catch(err => utils.respondError(err, res));
}

module.exports = {
    createObligatoryUnit: createObligatoryUnit,
    createWorkshop: createWorkshop,
    deleteObligatoryUnit: deleteObligatoryUnit,
    getAllObligatoryUnits: getAllObligatoryUnits,
    getAllWorkshopsForObligatoryUnit: getAllWorkshopsForObligatoryUnit,
    getObligatoryUnit: getObligatoryUnit,
    updateObligatoryUnit: updateObligatoryUnit
}