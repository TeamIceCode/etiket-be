const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;
const mongoose = require('mongoose');
const MONGO_URL = 'mongodb+srv://rye:teamicecode@teamicecode.cnraqdg.mongodb.net/etiket?retryWrites=true&w=majority'

mongoose.connection.once('open', () => {
    console.log('MongoDB Connected');
});

mongoose.connection.on('error', (err) => {
    console.log(err);
});

//Register a middleware function that parses incoming JSON payloads/requests
app.use(express.json());
app.use(cors({ origin: 'https://etiket-com-mu.vercel.app/' }))

// middleware logger
app.use((req, res, next) => {
    const start = Date.now();
    next();
    const delta = Date.now() - start;
    console.log(`${req.method} ${req.url} ${delta}ms`);
});

app.use('/accounts', require('./routes/accounts.router')); //routes
app.use('/movies', require('./routes/movies.router'));

mongoose.connect(MONGO_URL);
    
app.listen(PORT, () => {
    console.log(`Server is listening to http://localhost:${PORT}`);
});

