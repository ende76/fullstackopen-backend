const config = require('./utils/config');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const url = config.MONGODB_URI;

logger.info(`mongoDB connecting to ${url}`);

mongoose
    .connect(url, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('mongoDB connection established'))
    .catch(error => {
        console.log('mongoDB connection failed', error.message);
        process.exit(1);
    });

const express = require('express');
const app = express();
const entriesRouter = require('./controllers/entries');
const middleware = require('./utils/middleware');

const BASE_URL = '/api/persons';

app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use(BASE_URL, entriesRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;