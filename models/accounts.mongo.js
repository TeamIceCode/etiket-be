const mongoose = require('mongoose');
const validator = require('validator');

const accountsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    secretQuestion: {
        type: String,
        required: true,
    },
    secretAnswer: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    birthday: {
        type: String,
        required: true,
    },
    reservation: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('accounts', accountsSchema);