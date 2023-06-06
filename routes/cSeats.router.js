const express = require('express');

const cSeatsController = require('../controllers/cSeats.controller');

const cSeatsRouter = express.Router();

cSeatsRouter.put('/reservations', cSeatsController.reservations);
cSeatsRouter.get('/getConcertSeats', cSeatsController.getAllConcertSeats);
cSeatsRouter.post('/cancellations', cSeatsController.cancel);

module.exports = cSeatsRouter;