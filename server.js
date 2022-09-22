// heroku link https://morning-coast-38766.herokuapp.com/api/animals

const fs = require('fs');
const path = require('path');
const express = require('express');
const { animals } = require('./data/animals.json');

// tells Heroku to use their environment variable port, and if not, default to port 3001
const PORT = process.env.PORT || 3001;

// instantiate server
const app = express();

// MIDDLEWARE: functions mounted to server
// parse incoming string or array data // this method is a builtin Express.js method
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save animalsArray as filteredResults here:
    let filteredResults = animalsArray;

    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray, but here we're updating it for each trait in the .forEach loop.
            // For each trait being targeting by filter, the filteredResults array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one of the traits when the .forEach loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal (body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    // return finished code to post route for response
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

// get method requires two arguments, the route the client will fetch from
    // and the callback function that will execute every time the route is accessed with a GET request
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
})

// param(eter) routes must come after the other GET route
// req.param is specific to a single property, often intended to get a single record
// vs req.query which is multifaceted and often combines multiple parameters
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
})

// .post routes listen for POST requests instead of GET requests. POST requests represent a client requesting
    // that the server ACCEPT data.
app.post('/api/animals', (req, res) => {
    // req.body is where our incoming content will be
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        // add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);

        res.json(animal);
    }
});

// set the server up to listen using the listen() method
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`);
});