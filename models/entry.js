const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(response => console.log('mongoDB connection established'))
    .catch(error => {
        console.log('mongoDB connection failed', error.message);
        process.exit(1);
    });

const entrySchema = new mongoose.Schema({
    name: String,
    number: String,
});

entrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Entry', entrySchema);
