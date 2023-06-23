let accountsMongo = require('../models/accounts.mongo');
let moviesMongo = require('../models/movies.mongo');
let recordsMongo = require('../models/records.mongo');
let moment = require ('../node_modules/moment/moment');
const schedule = require('node-schedule');

// Automatic Ticket Sweeper Function //
schedule.scheduleJob('* * * * * *', () => {
    const currentTime = moment().format('x');
    moviesMongo.find({payment: "", expireX: { $lte: currentTime}}).then(async (movies) => {    
        if (movies.length) {   
                    await recordsMongo.updateMany(
                        {payment: "", expireX: { $lte: currentTime}},
                        {status: 'Expired'},
                    ).exec();
                    await moviesMongo.updateMany(
                        {payment: "", expireX: { $lte: currentTime}},
                        {status: 'Available'},
                    ).exec();
                    await moviesMongo.updateMany(
                        {payment: "", expireX: { $lte: currentTime}},
                        {reservedTo: ""},
                    ).exec();
                    await moviesMongo.updateMany(
                        {payment: "", expireX: { $lte: currentTime}},
                        {barcode: ""},
                    ).exec();
        } 
    await moviesMongo.find({scheduleX: { $lte: currentTime} }).then(async (movies) => {    
        if (movies.length) {   
                    await moviesMongo.updateMany(
                        {scheduleX: { $lte: currentTime}},
                        {status: 'Not Available'},
                    ).exec();
        } 
        }).catch ( err => {
            console.error('Error:', err);
        });
    });
    // console.log("Ticket Sweeper Successfull");
})



/// ADMIN SORTING  ///
function getAllSeats (req, res) 
{
    moviesMongo.find({}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsByBarcode (req, res) 
{
    const { barcode } = req.body;
    recordsMongo.find({barcode: barcode}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsByReservation (req, res) 
{
    const { email, barcode } = req.body;
    recordsMongo.find({reservedTo: email, barcode: barcode}).then(async (accounts) => {
        if (accounts.length) {
            await res.status(200).json(accounts);            
        } else {
            return res.status(200).json({status: false, message: 'Reservation Not Found'}); 
        }        
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsByTitleAndStatus (req, res) 
{
    const {movieTitle, status} = req.body;
    moviesMongo.find({movieTitle: movieTitle, status: status}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}



///// Sorting UI for My Reservations /////
function getAllSeatsByMyReservations (req, res) 
{
    const { email } = req.body;
    recordsMongo.find({reservedTo: email}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'No Reservations Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsByTitle (req, res) 
{
    const { email, movieTitle} = req.body;
    recordsMongo.find({reservedTo: email, movieTitle: movieTitle}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsBySchedule (req, res) 
{
    const { email, schedule } = req.body;
    recordsMongo.find({reservedTo: email, schedule: schedule}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}


function getSeatsByPrice (req, res) 
{
    
    const { email, minimumPrice, maximumPrice } = req.body;
    recordsMongo.find({reservedTo: email, price: { $gte: minimumPrice, $lte: maximumPrice }}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        } else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }        
    }).catch ( err => {
        console.error('Error:', err);        
    });
}


function getSeatsByStatus (req, res) 
{
    const {email, status} = req.body;
    recordsMongo.find({reservedTo: email, status: status}).then(async (movies) => {
        if (movies.length) {
            await res.status(200).json(movies);
        }
        else {
            return res.status(200).json({status: false, message: 'Seats Not Found'}); 
        }    
    }).catch ( err => {
        console.error('Error:', err);
    });
}



function  addSeats (req, res)
{
    const { movieTitle, schedule, seatNumber, ticketPrice, status, barcode, reservedTo, expiration, expireX, payment, scheduleX } = req.body;
    // const price = 'P'+`${ticketPrice}`;
    const price = ticketPrice;
    const screening = moment(`${schedule}`).format('ddd'+','+'MMM'+' '+'Do'+' '+'YYYY'+','+'LT');
    const ticketId = (`${movieTitle} | Seat number: ${seatNumber} | Screening: ${screening},`);
    const expire = moment(schedule).subtract(2, 'hours').format('YYYY'+'-'+'MM'+'-'+'DD'+' '+'kk'+':'+'mm');
    const expireZ = moment(schedule).subtract(2, 'hours').format('x');
    const scheduleZ = moment(schedule).format('x');
    
    moviesMongo.find({seatNumber: seatNumber, movieTitle: movieTitle, schedule: schedule}).then(async (movie) => {
        if (!movie.length) {
            await moviesMongo.create({ movieTitle, schedule, seatNumber, price, status, barcode, reservedTo, expiration, expireX, payment, scheduleX });
            await moviesMongo.updateOne(
                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                {expiration: expire},
            ).exec();
            await moviesMongo.updateOne(
                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                {expireX: expireZ},
            ).exec();
            await moviesMongo.updateOne(
                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                {scheduleX: scheduleZ},
            ).exec();
            return res.status(200).json({ status: true, message: `${ticketId} successfully registered!`});
        } else {
            return res.status(200).json({status: false, message: 'Seat already registered'});
        }
    });

}


/// UI RESERVATIONS FUNCTIONS ////
function reserveTicket (req, res) 
{
    const { email, password, movieTitle, seatNumber, schedule, price } = req.body;
    const barcode = Math.floor((Math.random() * 100000000000) + 1);
    const expire = moment(schedule).subtract(2, 'hours').format('YYYY'+'-'+'MM'+'-'+'DD'+' '+'kk'+':'+'mm');
    const expireX = moment(schedule).subtract(2, 'hours').format('x');
    const expireFE = moment(expire).format('ddd'+' '+'MMM'+' '+'Do'+' '+'YYYY'+' '+'LT');
    const screening = moment(`${schedule}`).format('ddd'+' '+'MMM'+' '+'Do'+' '+'YYYY'+' '+'LT')
    const ticketId = (`Movie: ${movieTitle} | Seat#: ${seatNumber} | Schedule: ${screening}`);
    const currentTime = moment().format('x');
    const scheduleZ = moment(schedule).format('x');

    moviesMongo.find({ movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule }).then(async (movies) => {    
        if (expireX <= currentTime || scheduleZ <= currentTime ) {   
            res.status(200).json({status: false, message: 'Reservation to this screening time is not allowed.'});
        } else {
            accountsMongo.find({email: email, password: password}).then(async accounts => {
                if (accounts.length){
                    moviesMongo.find({ movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule, barcode: "", price: price }).then(async reservation => {                
                        if (reservation.length) {
                            await accountsMongo.updateOne(
                                {email: email, password: password},
                                {reservation: barcode},
                            ).exec();
                            await moviesMongo.updateOne(
                                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                                {barcode: barcode},
                            ).exec();
                            await moviesMongo.updateOne(
                                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                                {status: 'Reserved'},
                            ).exec();
                            await moviesMongo.updateOne(
                                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                                {reservedTo: email},
                            ).exec();
                            await moviesMongo.updateOne(
                                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                                {expiration: expire},
                            ).exec();
                            await moviesMongo.updateOne(
                                {movieTitle: movieTitle, seatNumber: seatNumber, schedule: schedule},
                                {expireX: expireX},
                            ).exec();
                            await recordsMongo.insertMany([
                                {
                                    movieTitle: movieTitle,
                                    schedule: screening,
                                    seatNumber: seatNumber,
                                    price: price,
                                    status: 'Reserved',
                                    payment: "",
                                    barcode: barcode,
                                    reservedTo: email,
                                    expiration: expireFE,
                                    expireX: expireX,
                                }
                            ])
                            res.status(200).json({                    
                                message: (`Barcode: ${barcode}, Ticket Info: ${ticketId}, Reserved to: ${email}, Expiration: ${expireFE}`)
                            });
                        } else {
                            return res.send("Seat already taken or not available.");
                        }
                    })
                } else 
                {
                    return res.send("Invalid Credentials!");
                }
                
            })
        }   
        });

   
}


function cancelTicket (req, res) 
{
    const { email, password, barcode } = req.body;

    accountsMongo.find({ email: email, password: password }).then(async accounts => {
        if (accounts.length){
            moviesMongo.find({ barcode: barcode }).then(async reservation => {                
                if (reservation.length) {
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {status: 'Available'},
                    ).exec();
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {payment: ""},
                    ).exec();
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {reservedTo: ""},
                    ).exec();
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {expiration: ""},
                    ).exec();
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {expireX: ""},
                    ).exec();
                    await recordsMongo.updateOne(
                        {barcode: barcode},
                        {status: 'Cancelled'},
                    ).exec();
                    await moviesMongo.updateOne(
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



function expiredChecker (req, res) // MANUAL CHECKER //
{    
            const currentTime = moment().format('x');
            moviesMongo.find({payment: "Not Paid", expireX: { $lte: currentTime}}).then(async (movies) => {    
                if (movies.length) {   
                            await moviesMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {status: 'Available'},
                            ).exec();
                            await moviesMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {reservedTo: ""},
                            ).exec();
                            await moviesMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {expiration: ""},
                            ).exec();
                            await recordsMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {status: 'Expired'},
                            ).exec();
                            await moviesMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {barcode: ""},
                            ).exec();
                            await moviesMongo.updateMany(
                                {expireX: { $lte: currentTime}},
                                {expireX: ""},
                            ).exec();
                            res.status(200).json(movies);
                } else {
                    return res.status(200).json({status: false, message: 'No Expired Reservations Found'}); 
                }   
                });
}


function payment (req, res)
{
        const { email, password, barcode } = req.body;
        //const vars to hold msgs
        const INVALID_INPUT = 'Invalid credentials! Check email and password.';
        const PAYMENT_SUCCESS_MSG = () => `Thank you ${email}! you have successfully Reserved your seat !`; 
        
         //find the username that matches from postman input
        accountsMongo.find({email: email, password: password, barcode: barcode}).then(async (accounts)=> {
            if (accounts.length) {
                await moviesMongo.find({barcode: barcode}).then(async (pay) => {
                    if (pay.length) {
                        await moviesMongo.updateOne(
                            {barcode: barcode},
                            {payment: "Paid"},
                        ).exec();
                        await recordsMongo.updateOne(
                            {barcode: barcode},
                            {payment: "Paid"},
                        ).exec();
                        res.status(200).json({
                            status: true,
                            message: (PAYMENT_SUCCESS_MSG(email))
                        });
                    }
                    else{
                        return res.status(200).json({
                            status: false,
                            message: (INVALID_INPUT)
                        });
                    }
                });
            }
        });    
}

function payTicket (req, res) 
{
    const { email, password, barcode } = req.body;

    accountsMongo.find({ email: email, password: password }).then(async accounts => {
        if (accounts.length){
            moviesMongo.find({ barcode: barcode }).then(async reservation => {                
                if (reservation.length) {
                    await moviesMongo.updateOne(
                        {barcode: barcode},
                        {payment: 'Paid'},
                    ).exec();
                    await recordsMongo.updateOne(
                        {barcode: barcode},
                        {payment: 'Paid'},
                    ).exec();
                    res.status(200).json({                    
                        message: (`Thank you ${email}! you have successfully Reserved your seat !`)
                    });
                } else {
                    return res.send("Payment unsuccessful!");
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
    getSeatsByTitleAndStatus,
    getSeatsByPrice,
    getSeatsByReservation,
    reserveTicket,
    cancelTicket,
    expiredChecker,
    payment,
    payTicket,
    getAllSeatsByMyReservations,
    getSeatsByStatus
};