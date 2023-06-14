const mongoose = require('mongoose');

const moviesSchema = new mongoose.Schema({

    movieTitle: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: true,
    },
    seatNumber: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    barcode: {
        type: String,
        required: false,
    },  
    reservedTo: {
        type: String,
        required: false,
    },
    expiration: {
        type: String,
        required: false,
    },   

});

module.exports = mongoose.model('movies', moviesSchema);