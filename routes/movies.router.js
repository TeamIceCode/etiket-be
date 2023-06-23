const express = require('express');

const moviesController = require('../controllers/movies.controller');

const moviesRouter = express.Router();

moviesRouter.put('/reservations', moviesController.reserveTicket);
moviesRouter.put('/cancel', moviesController.cancelTicket);
moviesRouter.get('/getAllMovieSeats', moviesController.getAllSeats);
moviesRouter.post('/addMovieSeats', moviesController.addSeats);
moviesRouter.get('/getMovieSeatsByTitle', moviesController.getSeatsByTitle);
moviesRouter.get('/getMovieSeatsByPrice', moviesController.getSeatsByPrice);
moviesRouter.get('/getMovieSeatsBySchedule', moviesController.getSeatsBySchedule);
moviesRouter.get('/getMovieSeatsByTitleAndStatus', moviesController.getSeatsByTitleAndStatus);
moviesRouter.get('/getMovieSeatsByBarcode', moviesController.getSeatsByBarcode);
moviesRouter.get('/getMovieSeatsByReservation', moviesController.getSeatsByReservation);
moviesRouter.get('/getExpiredChecker', moviesController.expiredChecker);
moviesRouter.put('/payment', moviesController.payTicket);
moviesRouter.get('/getAllSeatsByMyReservations', moviesController.getAllSeatsByMyReservations);
moviesRouter.get('/getSeatsByStatus', moviesController.getSeatsByStatus);


module.exports = moviesRouter;
