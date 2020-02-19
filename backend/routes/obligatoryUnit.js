var express = require('express');
var auth = require('../services/auth');
var controller = require('../controllers/obligatoryUnit');

const obligatoryUnitRouter = express.Router();

obligatoryUnitRouter.get('/all', controller.getAllObligatoryUnits);
obligatoryUnitRouter.get('/:id/allWorkshops', controller.getAllWorkshopsForObligatoryUnit);
obligatoryUnitRouter.get('/:id', controller.getObligatoryUnit);
obligatoryUnitRouter.post('/', auth.isAdmin, controller.createObligatoryUnit);
obligatoryUnitRouter.put('/:id', auth.isAdmin, controller.updateObligatoryUnit);
obligatoryUnitRouter.delete('/:id', auth.isAdmin, controller.deleteObligatoryUnit);

module.exports = { obligatoryUnitRouter: obligatoryUnitRouter }