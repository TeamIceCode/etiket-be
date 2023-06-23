const mongoose = require('mongoose');

const recordsSchema = new mongoose.Schema({

    movieTitle: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: true,
    },
    expiration: {
        type: String,
        required: false,
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
    payment: {
        type: String,
        required: false,
    },
    barcode: {
        type: String,
        required: false,
    },  
    reservedTo: {
        type: String,
        required: false,
    },
    expireX: {
        type: Number,
        required: false,
    },
    scheduleX: {
        type: Number,
        required: false,
    } ,

})

module.exports = mongoose.model('records', recordsSchema);