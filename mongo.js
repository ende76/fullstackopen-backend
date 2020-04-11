const mongoose = require('mongoose');

const USAGE = 'Usage: node mongo.js <password> [<name> <number>]';

if (!(process.argv.length == 3 || process.argv.length == 5)) {
    console.log(USAGE);
    process.exit(1);
}

const createNewEntry = process.argv.length == 5;

const [password, name, number] = process.argv.slice(2);

const url = `mongodb+srv://fullstack:${password}@cluster0-vgoo7.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(response => console.log('connection established'))
    .catch(error => {
        console.log('connection failed', error.message);
        process.exit(1);
    });

const entrySchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Entry = mongoose.model('Entry', entrySchema);

if (createNewEntry) {
    const entry = new Entry({ name, number });
    
    entry.save()
        .then(response => {
            console.log('entry saved!');
            mongoose.connection.close();
        })
        .catch(error => {
            console.log(error);
            mongoose.connection.close();
        });
} else {
    Entry.find({})
        .then(result => {
            console.log("phonebook:");
            result.forEach(entry => console.log(entry.name, entry.number));
            mongoose.connection.close();
        })
        .catch(error => {
            console.log(error);
            mongoose.connection.close();
        });
}

