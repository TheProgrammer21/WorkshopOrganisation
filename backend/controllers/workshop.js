var db = require('../services/db');
var utils = require('../services/utils');
var obligatoryUnit = require('./obligatoryUnit');
var checker = require('expressjs-check');

function updateWorkshop(req, res) {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;
    let startDate = new Date(Date.parse(req.body.startDate));
    let duration = req.body.duration;
    let participants = req.body.participants;
    req.body.id = id; // For check() method

    if (checker.check(req.body, res, {
        name: { type: "string", required: true, maxLength: 64 },
        description: { type: "string", required: true, maxLength: 512 },
        duration: { type: "integer", required: true, min: 1 },
        participants: { type: "integer", required: true, min: 1 },
        startDate: { type: "date", required: true },
        endDate: { type: "date", required: true }
    })) return;

    if (checker.check({ id: id }, res, {
        id: { type: "integer", required: true }
    })) return;

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

    if (checker.check({ id: id }, res, {
        id: { type: "integer", required: true }
    })) return;

    db.query(res, "SELECT w.id, w.name, w.description, w.startDate, w.duration, w.participants, o.status \
                    FROM workshop w \
                    INNER JOIN obligatoryUnitWorkshop ow ON w.id = ow.workshopId \
                    INNER JOIN obligatoryUnit o ON ow.obligatoryUnitId = o.id \
                    WHERE w.id = ?;",
        [id], rows => {
            if (rows.length === 0) {
                utils.respondError("Not found", res, 404);
            } else {
                if (obligatoryUnit.getAllowedStatus(req.permissions).includes(rows[0].status + "")) {
                    rows.forEach(e => delete e.status); // remove not needed property
                    db.query(res, `SELECT uw.userId
                                    FROM userworkshop uw
                                    WHERE uw.workshopId = ?;`, [id, req.user], users => {
                        rows[0].currentParticipants = users.map(e => e.userId);
                        rows[0].registered = rows[0].currentParticipants.includes(req.user);
                        utils.respondSuccess(rows[0], res);
                    });
                } else {
                    utils.respondError("Forbidden", res, 403);
                }
            }
        });
}

function deleteWorkshop(req, res) {
    let id = req.params.id;

    if (checker.check({ id: id }, res, {
        id: { type: "integer", required: true }
    })) return;

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

    if (checker.check(req.body, res, {
        obligatoryUnit: { type: "integer", required: true },
        name: { type: "string", required: true, maxLength: 64 },
        description: { type: "string", required: true, maxLength: 512 },
        duration: { type: "integer", required: true, min: 1 },
        participants: { type: "integer", required: true, min: 1 }
    })) return;

    db.query(res, "SELECT createWorkshop(?, ?, ?, ?, ?, ?) \"id\"", [id, name, description, startDate, duration, participants], rows => {
        utils.respondSuccess({ id: rows[0].id }, res, 201);
    }, err => {
        utils.respondError("Not found", res, 404);
    });
}

// register current user for workshop
function register(req, res) {
    let id = req.params.id; // workshop id

    if (checker.check({ id: id }, res, {
        id: { type: "integer", required: true }
    })) return;

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