let mSeatsModel = require('../models/mSeats.model');
let accountsModel = require('../models/accounts.model');

function getAllMovieSeats (req, res) 
{
    // res.status(200).json(mSeatsModel);

    const mSeats = mSeatsModel.find(mSeats => mSeats.seatNumber === '');
    const { movieTitle, seatNumber, rowNumber, schedule } = req.body;  
    const d = new Date(schedule);
    const date = d.toDateString();
    const time = d.toLocaleTimeString();
    const screening = (date+'|'+time);

    if (mSeats) {     

        mSeats.schedule = screening;
        mSeats.seatNumber = seatNumber;
        mSeats.rowNumber = rowNumber;
        mSeats.movieTitle = movieTitle;

    const ticketId = (`${mSeats.movieTitle}|Seat#${mSeats.seatNumber}|Row#${mSeats.rowNumber}|${mSeats.schedule}`);

        mSeats.ticketId = ticketId;

        res.status(200).json(mSeatsModel);

    } else {
        res.status(200).json(mSeatsModel);
    }
}

function reserveTicket(req, res) 
{
    const { password, seatNumber, schedule } = req.body;
    const barcode = Math.floor((Math.random() * 1000000) + 1);
    const mSeats = mSeatsModel.find(mSeats => mSeats.seatNumber === seatNumber && mSeats.schedule === schedule && mSeats.barcode === '');
    const account = accountsModel.find(account => account.password === password );

    if (mSeats) {
        ticketId = mSeats.ticketId;
    }
    if (account) {
        email = account.email ;
    }

    if (account && mSeats)
    {
        mSeats.barcode = barcode;
        mSeats.reservedTo = email;
        return res.send(`Ticket Barcode: ${barcode} 
        Ticket ID: ${ticketId} 
        Reserved to: ${email}`);
    }
    else 
    {
        return !account ? res.send("Invalid Password ") : res.send("Seat already taken.");
    }
}



module.exports = 
{
    getAllMovieSeats,
    reserveTicket
};