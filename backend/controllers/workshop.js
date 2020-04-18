var db = require('../services/db');
var utils = require('../services/utils');
var obligatoryUnit = require('./obligatoryUnit');

function updateWorkshop(req, res) {
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

    db.query(res, "UPDATE workshop SET name = ?, description = ?, startDate = ?, duration = ?, participants = ? WHERE id = ?;", [name, description, startDate, duration, participants, id], rows => {
        if (rows.affectedRows === 0) {
            utils.respondError("Not found", res, 404);
        } else {
            utils.respondSuccess({ id: id }, res, 201);
        }
    });
}

function getWorkshop(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.query(res, "SELECT w.id, w.name, w.description, w.startDate, w.duration, w.participants, o.status, \
                    (SELECT COUNT(*) FROM userworkshop WHERE workshopId = ?) 'currentParticipants' \
                    FROM workshop w \
                    INNER JOIN obligatoryUnitWorkshop ow ON w.id = ow.workshopId \
                    INNER JOIN obligatoryUnit o ON ow.obligatoryUnitId = o.id \
                    WHERE w.id = ?;",
        [id, id], rows => {
            if (rows.length === 0) {
                utils.respondError("Not found", res, 404);
            } else {
                if (obligatoryUnit.getAllowedStatus(req.permissions).includes(rows[0].status + "")) {
                    rows.forEach(e => delete e.status); // remove not needed property
                    db.query(res, `SELECT COUNT(*) "count"
                                    FROM userworkshop uw
                                    WHERE uw.workshopId = ? AND uw.userId = ?;`, [id, req.user], count => {
                        rows[0].registered = count[0].count !== 0;
                        utils.respondSuccess(rows[0], res);
                    });
                } else {
                    utils.respondError("Unauthorized", res, 401);
                }
            }
        });
}

function deleteWorkshop(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.query(res, "DELETE FROM workshop WHERE id = ?;", [id], rows => {
        if (rows.affectedRows === 0) {
            utils.respondError("Not found", res, 404);
        } else {
            utils.respondSuccess(undefined, res);
        }
    });
}

function createWorkshop(req, res) {
    let id = req.body.obligatoryUnit;
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

    db.query(res, "SELECT createWorkshop(?, ?, ?, ?, ?, ?) \"id\"", [id, name, description, startDate, duration, participants], rows => {
        utils.respondSuccess({ id: rows[0].id }, res, 201);
    }, err => {
        utils.respondError("Not found", res, 404);
    });
}

// register current user for workshop
function register(req, res) {
    let id = req.params.id; // workshop id

    if (!utils.isNumber(id)) {
        utils.respondSuccess("Invalid id", res, 400);
        return;
    }

    db.query(res, "CALL registerWorkshop(?, ?)", [id, req.user], rows => {
        utils.respondSuccess(undefined, res, 200);
    }, err => {
        switch (err.errno) {
            case 1643:
                utils.respondError("Not found", res, 404);
                break;
            case 45000:
                utils.respondError("It is not possible to change the registration status for this workshop at the moment", res, 409);
                break;
            case 45001:
                utils.respondError("The maximum amount of participants is reached", res, 409);
                break;
            case 1062:
            case 45002:
                utils.respondError("User is already registered for this workshop", res, 409);
                break;
            case 45003:
                utils.respondError("The user is registered for another workshop at this time", res, 409);
                break;

        }
    });
}

// to undo registration for a workshop
function unregister(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondSuccess("Invalid id", res, 400);
        return;
    }

    db.query(res, "CALL unregisterFromWorkshop(?, ?);", [id, req.user], rows => {
        utils.respondSuccess(undefined, res, 200);
    }, err => {
        switch (err.errno) {
            case 1643:
                utils.respondError("Not found", res, 404);
                break;
            case 45000:
                utils.respondError("It is not possible to change the registration status for this workshop at the moment", res, 409);
                break;
            case 45001:
                utils.respondError("User has not registered for this workshop", res, 409);
                break;
        }
    });
}

module.exports = {
    getWorkshop: getWorkshop,
    updateWorkshop: updateWorkshop,
    deleteWorkshop: deleteWorkshop,
    createWorkshop: createWorkshop,
    register: register,
    unregister: unregister
}