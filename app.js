require('app-module-path').addPath(__dirname);

var express = require('express');
var compression = require('compression'); // Provides gzip compression for the HTTP response
var serveStatic = require('serve-static');

//hot reloading for development
require('marko/browser-refresh').enable();
require('optimizer/browser-refresh').enable('*.marko *.css *.less');

var isProduction = process.env.NODE_ENV === 'production';

// Configure the RaptorJS Optimizer to control how JS/CSS/etc. is
// delivered to the browser
require('./node_modules/optimizer').configure({
    plugins: [
        'optimizer-less', // Allow Less files to be rendered to CSS
        'optimizer-marko' // Allow Marko templates to be compiled and transported to the browser
    ],
    outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
    bundlingEnabled: isProduction, // Only enable bundling in production
    minify: isProduction, // Only minify JS and CSS code in production
    fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
    bundles: [ // Create a separate JavaScript bundle for jQuery
        {
            name: 'jquery',
            dependencies: [
                'require: jquery' // Put only the jquery module in this bundle
            ]
        }
    ]
});

var app = express();

var port = process.env.PORT || 3000;

// Enable gzip compression for all HTTP responses
app.use(compression());

// Allow all of the generated files under "static" to be served up by Express
app.use('/static', serveStatic(__dirname + '/static'));

// Map the "/" route to the home page
app.get('/', require('./src/pages/default'));

app.listen(port, function() {
    console.log('Listening on port %d', port);

    // The browser-refresh module uses this event to know that the
    // process is ready to serve traffic after the restart
    if (process.send) {
        process.send('online');
    }
});
