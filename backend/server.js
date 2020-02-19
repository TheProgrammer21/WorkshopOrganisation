var auth = require('./services/auth');
var obligatoryUnitRouter = require('./routes/obligatoryUnit');
var workshopRouter = require('./routes/workshop');

const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();
var backendPort = process.env.backendPort || 8085
var baseUrl = "/api";

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(auth.identify);
app.use((err, req, res, next) => respondError("Invalid JSON format", res, 400));

app.use(baseUrl + '/obligatoryUnit/', auth.loggedIn, obligatoryUnitRouter.obligatoryUnitRouter);
app.use(baseUrl + '/workshop', auth.loggedIn, workshopRouter.workshopRouter);

app.get(baseUrl + '/login', auth.login);
app.get(baseUrl + '/renew', auth.renewToken);

app.listen(backendPort, () => console.log("Server started on port " + backendPort));