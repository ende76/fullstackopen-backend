const entriesRouter = require('express').Router();
const Entry = require('../models/entry');

entriesRouter.get('/', (req, res, next) => {
    Entry.find({})
        .then(entries => res.json(entries))
        .catch(error => next(error));
});

entriesRouter.get('/:id', (req, res, next) => {
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

entriesRouter.post('/', (req, res, next) => {
    const { name, number } = req.body;
    const entry = new Entry({ name, number });

    entry.save()
        .then(savedEntry => res.json(savedEntry))
        .catch(error => next(error));
});

entriesRouter.put('/:id', (req, res, next) => {
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

entriesRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id;

    Entry.deleteOne({ _id : { '$eq': id } })
        .then(() => res.status(204).end())
        .catch(error => next(error));
});

entriesRouter.get('/info', (req, res, next) => {
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

module.exports = entriesRouter;