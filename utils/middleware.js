const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('body', req => (req.method === 'POST' || req.method === 'PUT') ? JSON.stringify(req.body) : '');
const requestLogger = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res),
    ].join(' ');
});

const unknownEndpoint = (_req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
    logger.error(error.name, error.message);

    switch (error.name) {
    case 'ValidationError':
        return res.status(400).send({ message: error.message });
    case 'CastError':
        return res.status(400).send({ message: 'malformed id' });
    default:
        break;
    }

    next(error);
};


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
};
