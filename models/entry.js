const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

mongoose
    .connect(url, { 
        useCreateIndex: true,
        useFindAndModify: false, 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    })
    .then(response => console.log('mongoDB connection established'))
    .catch(error => {
        console.log('mongoDB connection failed', error.message);
        process.exit(1);
    });

const entrySchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
    },
    number: {
        type: String,
        minlength: 8,
        required: true,
    },
});

entrySchema.plugin(uniqueValidator);


entrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Entry', entrySchema);
