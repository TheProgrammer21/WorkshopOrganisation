var express = require('express');
var auth = require('../services/auth');
var controller = require('../controllers/workshop');

const workshopRouter = express.Router();

workshopRouter.get('/:id', controller.getWorkshop);
workshopRouter.post('/', controller.createWorkshop);
workshopRouter.put('/:id', controller.updateWorkshop);
workshopRouter.delete('/:id', controller.deleteWorkshop);

module.exports = { workshopRouter: workshopRouter }