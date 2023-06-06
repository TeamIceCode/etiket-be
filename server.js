const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

//Register a middleware function that parses incoming JSON payloads/requests
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }))

// middleware logger
app.use((req, res, next) => {
    const start = Date.now();
    next();
    const delta = Date.now() - start;
    console.log(`${req.method} ${req.url} ${delta}ms`);
});

app.use('/accounts', require('./routes/accounts.router')); //routes
app.use('/mSeats', require('./routes/mSeats.router'));

app.listen(PORT, () => {
    console.log(`Server is listening to http://localhost:${PORT}`);
});
