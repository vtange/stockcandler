// server.js
// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var bar      = require('basic-login-bar');
var port     = process.env.PORT || 8080;

// configuration ===============================================================
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

// set up our express application

require('./app/routes.js')(app); // use "/" from own /app/routes.js
app.use(bar);				 // get all other user related routes

app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users

app.set('view engine', 'ejs'); // set up ejs for templating

app.listen(port);
console.log('The magic happens on port ' + port);
