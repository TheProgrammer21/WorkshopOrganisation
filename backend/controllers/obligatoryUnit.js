var db = require('../services/db');
var utils = require('../services/utils');
var auth = require('../services/auth');

var obligatoryUnit = {
    invisible: 0, // just created, still working on - not shown to anyone but admins
    hidden: 1, // done old unit - not shown to anyone but admins
    registerable: 2, // shown to anyone - students can register
    closed: 3 // shown to all but noone cannot register
}

function getAllowedStatus(permissions) {
    switch (auth.translatePermission(permissions)) {
        case "student":
            return ["2", "3"];
        case "admin":
            return ["0", "1", "2", "3"];
    }
}

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
                    let status = rows[0].status;
                    if (status === obligatoryUnit.hidden || status === obligatoryUnit.invisible) { // hidden, only admins can see
                        if (auth.translatePermission(req.permissions) === "admin") {
                            utils.respondSuccess(rows[0], res)
                        } else {
                            utils.respondError("Unauthorized", res, 401);
                        }
                    }
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function getAllObligatoryUnits(req, res) {
    let status = req.query.status; // can be filtered by status: separated by ',': 0,1,2
    let allowedStatus;

    if (status === undefined) { // set status to send back all
        status = ["0", "1", "2", "3"];
    } else {
        status = status.split(',');
        if (!status.every(utils.isNumber)) {
            utils.respondError("Invalid status filter", res, 400);
            return;
        }
    }

    allowedStatus = getAllowedStatus(req.permissions);

    // filter that only those that are requested but also allowed are selected
    status = status.filter(x => allowedStatus.includes(x));

    if (status.length === 0) { // there are no units that this user could possibly see because of permissions
        console.log("hier");
        utils.respondError("Unauthorized", res, 401);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("SELECT * FROM obligatoryUnit WHERE status IN " + db.createInString(status) + ";", status)
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
        conn.query("SELECT w.id, w.name, w.description, w.startDate, w.duration, w.participants, o.status \
                    FROM obligatoryUnitWorkshop ow \
                    INNER JOIN workshop w ON ow.workshopId = w.id \
                    INNER JOIN obligatoryUnit o ON o.id = ow.obligatoryUnitId \
                    WHERE obligatoryUnitId = ?;", [id])
            .then(rows => {
                if (rows.length === 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    // is the use authorized to see the obligatory unit
                    if (getAllowedStatus(req.permissions).includes("" + rows[0].status)) {
                        rows.forEach(e => delete e.status); // not needed by client
                        utils.respondSuccess(rows, res);
                    } else {
                        utils.respondError("Unauthorized", res, 401);
                    }
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

module.exports = {
    createObligatoryUnit: createObligatoryUnit,
    deleteObligatoryUnit: deleteObligatoryUnit,
    getAllObligatoryUnits: getAllObligatoryUnits,
    getAllWorkshopsForObligatoryUnit: getAllWorkshopsForObligatoryUnit,
    getObligatoryUnit: getObligatoryUnit,
    updateObligatoryUnit: updateObligatoryUnit
}