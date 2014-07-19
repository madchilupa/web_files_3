'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var express = require('express'),
    config = require('./config'),
    expressLoad = require('express-load'),
    path = require('path');

var app = express();

// Express settings
require('./express')(app);

// Bootstrap routes
var routesPath = path.join(__dirname, 'routes');
expressLoad(routesPath, {
    extlist: /(.*)\.(js$)/
}).into(app);


// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('Express app started on port ' + port);

module.exports = app;