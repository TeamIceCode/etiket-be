const express = require('express');

const mSeatsController = require('../controllers/mSeats.controller');

const mSeatsRouter = express.Router();

mSeatsRouter.put('/reservations', mSeatsController.reserveTicket);
mSeatsRouter.get('/getAllMovieSeats', mSeatsController.getAllMovieSeats);
// mSeatsRouter.post('/cancellations', mSeatsController.cancel);

module.exports = mSeatsRouter;