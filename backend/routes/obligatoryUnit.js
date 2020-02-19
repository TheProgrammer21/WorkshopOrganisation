var express = require('express');
var auth = require('../services/auth');
var controller = require('../controllers/obligatoryUnit');

const obligatoryUnitRouter = express.Router();

obligatoryUnitRouter.get('/all', controller.getAllObligatoryUnits);
obligatoryUnitRouter.get('/:id/allWorkshops', controller.getAllWorkshopsForObligatoryUnit);
obligatoryUnitRouter.get('/:id', controller.getObligatoryUnit);
obligatoryUnitRouter.post('/', controller.createObligatoryUnit);
obligatoryUnitRouter.put('/:id', controller.updateObligatoryUnit);
obligatoryUnitRouter.delete('/:id', controller.deleteObligatoryUnit);

module.exports = { obligatoryUnitRouter: obligatoryUnitRouter }