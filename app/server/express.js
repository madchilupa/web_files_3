'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    consolidate = require('consolidate'),
    helpers = require('view-helpers'),
    config = require('./config');

module.exports = function(app) {
    app.set('showStackError', true);

    // Prettify HTML
    app.locals.pretty = true;
    // cache=memory or swig dies in NODE_ENV=production
    app.locals.cache = 'memory';

    // Should be placed before express.static
    // To ensure that all assets and data are compressed (utilize bandwidth)
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        // Levels are specified in a range of 0 to 9, where-as 0 is
        // no compression and 9 is best compression, but slowest
        level: 9
    }));

    // assign the template engine to .html files
    app.engine('html', consolidate[config.templateEngine]);

    // set .html as the default extension
    app.set('view engine', 'html');

    // Enable jsonp
    app.enable('jsonp callback');

    app.configure(function() {
        // The cookieParser should be above session
        app.use(express.cookieParser());

        // Request body parsing middleware should be above methodOverride
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());

        // needs to go before app.use(app.router)
        if (process.env.NODE_ENV === 'dev') {
            app.use(express.logger('dev'));
        }

        // Dynamic helpers
        app.use(helpers(config.app.name));

        // Connect flash for flash messages
        //app.use(flash()); //not sure if we want this?

        // Routes should be at the last
        app.use(app.router);

        // Setting the static folder
        app.use(express.static(config.root + '/app'));

        // Assume 404 since no middleware responded
        app.use(function(req, res) {
            res.status(404).json('404', {
                url: req.originalUrl,
                error: 'Not found'
            });
        });

    });
};