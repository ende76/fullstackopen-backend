const express = require('express');
const app = express();
const morgan = require('morgan');

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

const phonebook = 
    {
        "persons": [
        {
            "name": "Arto Hellas",
            "number": "040-123456",
            "id": 1
        },
        {
            "name": "Ada Lovelace",
            "number": "39-44-5323523",
            "id": 2
        },
        {
            "name": "Dan Abramov",
            "number": "12-43-234345",
            "id": 3
        },
        {
            "name": "Mary Poppendieck",
            "number": "39-23-6423122",
            "id": 4
        }
        ]
    };

const MAX_ID = 1000000;
const generateId = usedIds => {
    while (true) {
        const newId = Math.floor(Math.random() * MAX_ID) + 1;

        if (!usedIds[newId]) return newId;
    }
};

const getValidationError = entry => {
    if (!entry.name) return 'name is required';
    if (!entry.number) return 'number is required';
    if (phonebook.persons.find(({name}) => entry.name === name)) return `name ${entry.name} already exists`;

    return false;
};

app.get('/api/persons', (req, res) => res.json(phonebook.persons));

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    const person = phonebook.persons.find((entry) => entry.id === id);

    if (!person) {
        res.status(404).end();
    } else {
        res.json(person);
    }
});

app.post('/api/persons', (req, res) => {
    const entry = {...req.body};
    const validationError = getValidationError(entry);

    if (validationError) {
        res.status(400).json({ error: validationError});
        return;
    }

    entry.id = generateId(phonebook.persons.reduce(
        (used, entry) => {
            used[entry.id] = true;
            return used;
        },
    {}));

    phonebook.persons.push(entry);

    res.json(entry);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    phonebook.persons = phonebook.persons.filter((entry) => entry.id != id);

    res.status(204).end();
});

app.get('/info', (req, res) => {
    const countPersonsInfo = 
        `<p>Phonebook has info for ${phonebook.persons.length} people</p>`;
    const timestampInfo = 
        `<p>${new Date()}</p>`;

        res.end(`<div>${countPersonsInfo}${timestampInfo}</div>`);
});

const unknownEndpoint = (request, response) => 
    {
        response.status(404).send({ error: 'unknown endpoint' });
    }
  
app.use(unknownEndpoint)

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});