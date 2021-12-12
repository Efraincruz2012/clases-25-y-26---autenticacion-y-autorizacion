const { mongoose } = require('../config/mongodb_config.js');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    nombre: String,
    password: String,
    email: String
}, {collection: 'user'});

const UserModel = mongoose.model('UserModel', userSchema);

module.exports = UserModel;