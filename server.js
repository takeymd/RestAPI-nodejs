// Get the packages we need
var express = require('express');
var config = require('./config/config.js');
var busboyBodyParser = require("busboy-body-parser");

// Use environment defined port or 3000
var port = (config.PORT || 3000);

// Create our Express application
var app = express();

app.use(busboyBodyParser());

app.use(function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
    next();
});

var routes = require('./routes/routes.js')(app);
 
var server = app.listen(process.env.PORT || port, function () {
    console.log("api.cultish.com listening on port %s...", server.address().port);
});