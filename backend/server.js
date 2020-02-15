const express = require('express');
const helmet = require('helmet');
const mariadb = require('mariadb');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());