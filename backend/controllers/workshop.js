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
    req.body.id = id; // For check() method

    if(!check(req.body, res, {
        id: {type:"integer", required:true},
        name: {type:"string", required:true, maxLength:64},
        description: {type:"string", required:true, maxLength: 512},
        status: {type:"integer", required:true, min:0, max:3},
        duration: {type: "integer", required:true, min:1},
        participants: {type:"integer", required:true, min:1},
        startDate: {type:"date", required:true},
        endDate: {type:"date", required:true}
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

    if(!check({id:id}, res, {
        id: {type:"integer", required:true}
    })) return;

    db.query(res, "SELECT w.id, w.name, w.description, w.startDate, w.duration, w.participants, o.status FROM workshop w \
                    INNER JOIN obligatoryUnitWorkshop ow ON w.id = ow.workshopId \
                    INNER JOIN obligatoryUnit o ON ow.obligatoryUnitId = o.id \
                    WHERE w.id = ?;",
        [id], rows => {
            if (rows.length === 0) {
                utils.respondError("Not found", res, 404);
            } else {
                if (obligatoryUnit.getAllowedStatus(req.permissions).includes(rows[0].status + "")) {
                    rows.forEach(e => delete e.status); // remove not needed property
                    utils.respondSuccess(rows[0], res);
                } else {
                    utils.respondError("Unauthorized", res, 401);
                }
            }
        });
}

function deleteWorkshop(req, res) {
    let id = req.params.id;

    if(!check({id:id}, res, {
        id: {type:"integer", required:true}
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

    if(!check(req.body, res, {
        id: {type:"integer", required:true},
        name: {type:"string", required:true, maxLength:64},
        description: {type:"string", required:true, maxLength: 512},
        status: {type:"integer", required:true, min:0, max:3},
        duration: {type: "integer", required:true, min:1},
        participants: {type:"integer", required:true, min:1},
        startDate: {type:"date", required:true},
        endDate: {type:"date", required:true}
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

    if(!check({id:id}, res, {
        id: {type:"integer", required:true}
    })) return;

    db.query(res, "SELECT COUNT(*) AS 'amount', participants FROM workshopUser INNER JOIN workshop ON workshopId = id WHERE workshopId = ?;", [id], rows => {
        if (rows[0].amount >= rows[0].participants) { // if the maximum amount of participants is reached yet
            utils.respondError("Maximum participants for workshop reached", res, 409);
        } else {
            db.query(res, "CALL registerWorkshop(?, ?)", [id, req.user], rows => {
                // Todo
            }, err => {
                // Todo
            })
        }
    })
}

module.exports = {
    getWorkshop: getWorkshop,
    updateWorkshop: updateWorkshop,
    deleteWorkshop: deleteWorkshop,
    createWorkshop: createWorkshop,
    register: register
}