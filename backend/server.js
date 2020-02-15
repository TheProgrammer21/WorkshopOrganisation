const express = require('express');
const helmet = require('helmet');
const mariadb = require('mariadb');
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

var dbPort = process.env.dbPort || 3306
var dbUser = process.env.dbUser || "root"
var dbPassword = process.env.dbPassword || "maria"
var backendPort = process.env.backendPort || 8085

const pool = mariadb.createPool({ host: "localhost", port: dbPort, user: dbUser, password: dbPassword, connectionLimit: 50, database: "workshop" });