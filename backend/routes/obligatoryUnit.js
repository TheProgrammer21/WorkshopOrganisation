var express = require('express');
var controller = require('../controllers/obligatoryUnit.js');

const obligatoryUnitRouter = express.Router();

obligatoryUnitRouter.get('/all', controller.getAllObligatoryUnits);
obligatoryUnitRouter.get('/:id/allWorkshops', controller.getAllWorkshopsForObligatoryUnit);
obligatoryUnitRouter.get('/:id', controller.getObligatoryUnit);
obligatoryUnitRouter.post('/', controller.createObligatoryUnit);
obligatoryUnitRouter.put('/:id', controller.updateObligatoryUnit);
obligatoryUnitRouter.delete('/:id', controller.deleteObligatoryUnit);

module.exports = { obligatoryUnitRouter: obligatoryUnitRouter }