var db = require('../services/db.js');
var utils = require('../services/utils.js');

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

    db.getConnection().then(conn => {
        conn.query("UPDATE workshop SET name = ?, description = ?, startDate = ?, duration = ?, participants = ? WHERE id = ?;", [name, description, startDate, duration, participants, id])
            .then(rows => {
                if (rows.affectedRows === 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    utils.respondSuccess({ id: id }, res, 201);
                }
            }).catch(err => {
                utils.respondError(err, res);
                conn.release();
            }).finally(() => conn.release());;
    }).catch(err => utils.respondError(err, res));
}

function getWorkshop(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("SELECT * FROM workshop WHERE id = ?;", [id])
            .then(rows => {
                if (rows.length === 0) {
                    utils.respondError("Not found", res, 404);
                } else {
                    utils.respondSuccess(rows[0], res);
                }
            }).catch(err => utils.respondError(err, res))
            .finally(() => conn.release());
    }).catch(err => utils.respondError(err, res));
}

function deleteWorkshop(req, res) {
    let id = req.params.id;

    if (!utils.isNumber(id)) {
        utils.respondError("Invalid id", res, 400);
        return;
    }

    db.getConnection().then(conn => {
        conn.query("DELETE FROM workshop WHERE id = ?;", [id])
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

module.exports = {
    getWorkshop: getWorkshop,
    updateWorkshop: updateWorkshop,
    deleteWorkshop: deleteWorkshop
}