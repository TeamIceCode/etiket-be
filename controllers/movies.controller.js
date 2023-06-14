let accountsMongo = require('../models/accounts.mongo');
let moviesMongo = require('../models/movies.mongo');
let recordsMongo = require('../models/records.mongo');
let moment = require ('../node_modules/moment/moment');


function getAllSeats (req, res) 
{
    moviesMongo.find({}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByBarcode (req, res) 
{
    const { barcode } = req.body;
    recordsMongo.find({barcode: barcode}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByTitle (req, res) 
{
    const { movieTitle} = req.body;
    moviesMongo.find({movieTitle: movieTitle}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsBySchedule (req, res) 
{
    const { schedule} = req.body;
    moviesMongo.find({schedule: schedule}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByTitleAndSchedule (req, res) 
{
    const {movieTitle, schedule} = req.body;
    moviesMongo.find({movieTitle: movieTitle, schedule: schedule}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByTitleAndStatus (req, res) 
{
    const {movieTitle, status} = req.body;
    recordsMongo.find({movieTitle: movieTitle, status: status}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByPrice (req, res) 
{
    
    const { minimumPrice, maximumPrice } = req.body;
    moviesMongo.find({price: { $gte: minimumPrice, $lte: maximumPrice }}).then(async (movies) => {
        await res.status(200).json(movies);
    });
}

function getSeatsByReservation (req, res) 
{
    const { email, reservation } = req.body;
    accountsMongo.find({email: email, reservation: reservation}).then(async (accounts) => {
        if (accounts.length) {
            recordsMongo.find({barcode: reservation}).then(async (records) => {
                await res.status(200).json(records);
            });
        } else {
            return res.status(200).json({status: false, message: 'Reservation Not Found'}); 
        }        
    });
}

function  addSeats (req, res)
{
    const { movieTitle, schedule, seatNumber, ticketPrice, status, barcode, reservedTo, expiration } = req.body;
    // const price = 'P'+`${ticketPrice}`;
    const price = ticketPrice;
    const screening = moment(`${schedule}`).format('ddd'+','+'MMM'+' '+'Do'+' '+'YYYY'+','+'LT');
    const ticketId = (`${movieTitle} | Seat number: ${seatNumber} | Screening: ${screening},`);

    moviesMongo.find({seatNumber: seatNumber, movieTitle: movieTitle, schedule: schedule}).then(async (movie) => {
        if (!movie.length) {
            await moviesMongo.create({ movieTitle, schedule, seatNumber, price, status, barcode, reservedTo, expiration });
            return res.status(200).json({ status: true, message: `${ticketId} successfully registered!`});
        } else {
            return res.status(200).json({status: false, message: 'Seat already registered'});
        }
    });

}

function reserveTicket (req, res) 
{
    const { email, password, movieTitle, seatNumber, schedule, price } = req.body;
    const barcode = Math.floor((Math.random() * 100000000000) + 1);
    const expire = moment(schedule).subtract(2, 'hours').format('YYYY'+'-'+'MM'+'-'+'DD'+' '+'kk'+':'+'mm');
    const expireFE = moment(expire).format('ddd'+' '+'MMM'+' '+'Do'+' '+'YYYY'+' '+'LT');
    const screening = moment(`${schedule}`).format('ddd'+' '+'MMM'+' '+'Do'+' '+'YYYY'+' '+'LT')
    const ticketId = (`Movie: ${movieTitle} | Seat#: ${seatNumber} | Schedule: ${screening}`);

    accountsMongo.find({email: email, password: password}).then(accounts => {
        if (accounts.length){
            moviesMongo.find({ movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule, barcode: "", price: price }).then(reservation => {                
                if (reservation.length) {
                    accountsMongo.updateOne(
                        {email: email, password: password},
                        {reservation: barcode},
                    ).exec();
                    moviesMongo.updateOne(
                        {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                        {barcode: barcode},
                    ).exec();
                    moviesMongo.updateOne(
                        {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                        {status: 'Reserved'},
                    ).exec();
                    moviesMongo.updateOne(
                        {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                        {reservedTo: email},
                    ).exec();
                    moviesMongo.updateOne(
                        {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                        {expiration: expire},
                    ).exec();
                    recordsMongo.insertMany([
                        {
                            movieTitle: movieTitle,
                            schedule: schedule,
                            seatNumber: seatNumber,
                            price: price,
                            status: 'Reserved',
                            payment: 'Not Paid',
                            barcode: barcode,
                            reservedTo: email,
                            expiration: expire,
                        }
                    ])

                    res.status(200).json({                    
                        message: (`Barcode: ${barcode}, Ticket Info: ${ticketId}, Reserved to: ${email}, Expiration: ${expireFE}`)
                    });
                } else {
                    return res.send("Seat already taken.");
                }
            })
        } else 
        {
            return res.send("Invalid Credentials!");
        }
        
    })
}

function cancelTicket (req, res) 
{
    const { email, password, barcode } = req.body;

    accountsMongo.find({ email: email, password: password }).then(accounts => {
        if (accounts.length){
            moviesMongo.find({ barcode: barcode }).then(reservation => {                
                if (reservation.length) {
                    recordsMongo.updateOne(
                        {barcode: barcode},
                        {status: 'Cancelled'},
                    ).exec();
                    moviesMongo.updateOne(
                        {barcode: barcode},
                        {status: 'Available'},
                    ).exec();
                    moviesMongo.updateOne(
                        {barcode: barcode},
                        {reservedTo: ""},
                    ).exec();
                    moviesMongo.updateOne(
                        {barcode: barcode},
                        {expiration: ""},
                    ).exec();
                    moviesMongo.updateOne(
                        {barcode: barcode},
                        {barcode: ""},
                    ).exec();
                    res.status(200).json({                    
                        message: (`Reservation of ${email}, is cancelled.`)
                    });
                } else {
                    return res.send("Reservation not found!");
                }
            })
        } else 
        {
            return res.send("Invalid Credentials!");
        }
        
    })
}


module.exports = 
{
    getAllSeats,
    addSeats,
    getSeatsByBarcode,
    getSeatsByTitle,
    getSeatsBySchedule,
    getSeatsByTitleAndSchedule,
    getSeatsByTitleAndStatus,
    getSeatsByPrice,
    getSeatsByReservation,
    reserveTicket,
    cancelTicket
};