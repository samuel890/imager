"use strict";

var path = require('path');


module.exports = {
  port: process.env.PORT || '8080',

  /* Secret is used by sessions to encrypt the cookie */
  secret: 'your-secret-here',

  logPath: process.env.LOG_PATH || './',

  /*
    dataBackend can be 'datastore', 'cloudsql', or 'mongodb'. Be sure to
    configure the appropriate settings for each storage engine below.
    Note that datastore requires no additional configuration.
  */
  dataBackend: 'datastore',

  /*
    This can also be your project id as each project has a default
    bucket with the same name as the project id.
  */
  cloudStorageBucket: 'bostonbookshelf',

  /*
    This is the id of your project in the Google Developers Console.
  */
  gcloud: {
    projectId: 'bostonbookshelf'
  },

  /*
    The client ID and secret can be obtained by generating a new Client ID for
    a web application on Google Developers Console.
  */
  oauth2: {
    clientId: '1007231344488-3om53v1kec1ia5tcbhsoe74k27ohsugm.apps.googleusercontent.com',
    clientSecret: 'HfqBEGjtdShVXp-O2y7wU55M',
    redirectUrl: process.env.OAUTH2_CALLBACK || 'http://localhost:8080/oauth2callback',
    scopes: ['email', 'profile']
  }
};
