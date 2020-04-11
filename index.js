require('dotenv').config();

const express = require('express');
const app = express();
const morgan = require('morgan');
const Entry = require('./models/entry');

app.use(express.static('build'))
app.use(express.json());

morgan.token('body', (req, res) => (req.method == 'POST') ? JSON.stringify(req.body) : "");
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req, res),
    ].join(' ')
  }));

const getValidationError = entry => {
    if (!entry.name) return new Promise().resolve('name is required');
    if (!entry.number) return new Promise().resolve('number is required');
    return Entry.findOne({name: { "$eq": entry.name }})
        .then(entry => {
            if (entry === null) return false;
            return `name ${entry.name} already exists`;
        });
};

const BASE_URL = '/api/persons/';

app.get(BASE_URL, (req, res) => {
    Entry.find({})
        .then(entries => {
            console.log(entries);
            res.json(entries);
        })
        .catch(error => console.log(error.message));
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

app.post(BASE_URL, (req, res) => {
    const {name, number} = {...req.body};
    getValidationError({name, number})
        .then(error => {
            if (error) {
                res.status(400).json({ error: validationError});
                return;
            }
        
            const entry = new Entry({ name, number });

            entry.save()
                .then(savedEntry => {
                    res.json(savedEntry);
                })
                .catch(error => {
                    console.log(error.message);
                    res.status(500).end();
                });
        })

});

app.delete(`${BASE_URL}:id`, (req, res) => {
    const id = req.params.id;

    Entry.deleteOne({ _id : { "$eq": id}})
        .then(response => res.status(204).end())
        .catch(error => res.status(500).send(JSON.stringify(error)).end());
});

app.get('/info', (req, res) => {
    Entry.estimatedDocumentCount()
        .then(count => {
            const countPersonsInfo = 
                `<p>Phonebook has info for ${count} people</p>`;
            const timestampInfo = 
                `<p>${new Date()}</p>`;
    
            res.end(`<div>${countPersonsInfo}${timestampInfo}</div>`);
        })
        .catch(error => res.status(500).send(error.message).end());
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
  
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' });
    } 

    next(error);
};
    
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});