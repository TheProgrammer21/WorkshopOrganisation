var express = require('express');
var auth = require('../services/auth');
var controller = require('../controllers/workshop');

const workshopRouter = express.Router();

workshopRouter.get('/:id', controller.getWorkshop);
workshopRouter.post('/', auth.isAdmin, controller.createWorkshop);
workshopRouter.put('/:id', auth.isAdmin, controller.updateWorkshop);
workshopRouter.delete('/:id', auth.isAdmin, controller.deleteWorkshop);
workshopRouter.post('/:id/register', controller.register)

module.exports = { workshopRouter: workshopRouter }