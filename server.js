const express = require('express');
const { animals } = require('./data/animals.json');

// instantiate server
const app = express();

// get method requires two arguments, the route the client will fetch from
    // and the callback function that will execute every time the route is accessed with a GET request
app.get('/api/animals', (req, res) => {
    res.json(animals);
})

// set the server up to listen using the listen() method
app.listen(3001, () => {
    console.log(`API server now on port 3001`);
});