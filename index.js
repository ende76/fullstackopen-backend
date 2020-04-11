require('dotenv').config();

const express = require('express');
const app = express();
const morgan = require('morgan');
const Entry = require('./models/entry');

app.use(express.static('build'));
app.use(express.json());

morgan.token('body', req => (req.method === 'POST' || req.method === 'PUT') ? JSON.stringify(req.body) : '');
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res),
    ].join(' ');
}));

const BASE_URL = '/api/persons/';

app.get(BASE_URL, (req, res, next) => {
    Entry.find({})
        .then(entries => res.json(entries))
        .catch(error => next(error));
});

app.get(`${BASE_URL}:id`, (req, res, next) => {
    const id = req.params.id;

    Entry.findById(id)
        .then(entry => {
            if (entry === null) {
                res.status(404).end();
            } else {
                res.json(entry);
            }
        })
        .catch(error => next(error));
});

app.post(BASE_URL, (req, res, next) => {
    const { name, number } = req.body;
    const entry = new Entry({ name, number });

    entry.save()
        .then(savedEntry => res.json(savedEntry))
        .catch(error => next(error));
});

app.put(`${BASE_URL}:id`, (req, res, next) => {
    const id = req.params.id;
    const { name, number } = req.body;
    const entryData = { name, number };

    Entry.findByIdAndUpdate(id, entryData, { new: true, runValidators: true, context: 'query' })
        .then(updatedEntry => {
            if (updatedEntry === null) {
                return res.sendStatus(404);
            }
            return res.json(updatedEntry);
        })
        .catch(error => next(error));
});

app.delete(`${BASE_URL}:id`, (req, res, next) => {
    const id = req.params.id;

    Entry.deleteOne({ _id : { '$eq': id } })
        .then(res => res.status(204).end())
        .catch(error => next(error));
});

app.get('/info', (req, res, next) => {
    Entry.estimatedDocumentCount()
        .then(count => {
            const countPersonsInfo =
                `<p>Phonebook has info for ${count} people</p>`;
            const timestampInfo =
                `<p>${new Date()}</p>`;

            res.end(`<div>${countPersonsInfo}${timestampInfo}</div>`);
        })
        .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
    console.error(error.name, error.message);

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

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});