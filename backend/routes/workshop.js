var express = require('express');
var controller = require('../controllers/workshop.js');

const workshopRouter = express.Router();

workshopRouter.get('/:id', controller.getWorkshop);
workshopRouter.put('/:id', controller.updateWorkshop);
workshopRouter.delete('/:id', controller.deleteWorkshop);

module.exports = { workshopRouter: workshopRouter }