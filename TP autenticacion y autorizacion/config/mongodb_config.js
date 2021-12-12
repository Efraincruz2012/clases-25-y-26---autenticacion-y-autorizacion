//Import the mongoose module
const mongoose = require('mongoose');

//connection
var mongoDB = 'mongodb://localhost/user';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

//mensage de error
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = { db, mongoose };