"use strict";

var path = require('path');
var express = require('express');
var session = require('cookie-session');
var gcloud = require('gcloud');
var upload = require('jquery-file-upload-middleware');
var config = require('./config');
var logging = require('./lib/logging')(config.logPath);

// configure upload middleware
upload.configure({
  uploadDir: __dirname + 'public/uploads',
  uploadUrl: '/uploads',
  imageversion: {
    thumbnail: {
      width: 80,
      height: 80
    }
  }
});

var app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);


/*
  Add the request logger before anything else so that it can
  accurately log requests.
*/
app.use(logging.requestLogger);


/*
  Configure the session and session storage.
  MemoryStore isn't viable in a multi-server configuration, so we
  use encrypted cookies. Redis or Memcache is a great option for
  more secure sessions, if desired.
*/
app.use(session({
  secret: config.secret,
  signed: true
}));


/* Include the app engine handlers to respond to start, stop, and health checks. */
app.use(require('./lib/appengine-handlers'));


/* OAuth2 */
var oauth2 = require('./lib/oauth2')(config.oauth2);

app.use(oauth2.router);

/* Static files */
app.use('/public', express.static(__dirname + "/public"));


/* Books */
var background = require('./lib/background')(config.gcloud, logging);
var images = require('./lib/images')(config.gcloud, config.cloudStorageBucket, logging);
var model = require('./imagebook/model-' + config.dataBackend)(config, background);

app.use('/images', require('./imagebook/crud')(model, images, oauth2));
app.use('/api/images', require('./imagebook/api')(model));


/* Redirect root to /books */
app.get('/', function(req, res) {
  res.redirect('/images');
});


/*
  Add the error logger after all middleware and routes so that
  it can log errors from the whole application. Any custom error
  handlers should go after this.
*/
app.use(logging.errorLogger);


/* Start the server */
var server = app.listen(config.port, '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
