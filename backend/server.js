const auth = require('./services/auth');
const obligatoryUnitRouter = require('./routes/obligatoryUnit');
const workshopRouter = require('./routes/workshop');
const utils = require('./services/utils');

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const backendPort = process.env.backendPort || 8085
const baseUrl = '/api';

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use((err, req, res, next) => utils.respondError('Invalid JSON format', res, 400));
app.use(auth.identify);

app.use(baseUrl + '/obligatoryUnit/', auth.loggedIn, obligatoryUnitRouter.obligatoryUnitRouter);
app.use(baseUrl + '/workshop', auth.loggedIn, workshopRouter.workshopRouter);

app.post(baseUrl + '/login', auth.login);

app.listen(backendPort, () => console.log('Server started on port ' + backendPort));

app.use((err, req, res, next) => utils.respondError('Internal Server error', res, 500));