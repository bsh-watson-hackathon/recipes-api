'use strict';

// npm
const http = require('http')

// private
const app = require('./lib/app');
const dbMongo = require('./lib/dbMongo');
const dbCloudant = require('./lib/dbCloudant');

let connectionMongo = null;
let connectionCloudant = null;

if (process.env.VCAP_SERVICES) {
  let env = JSON.parse(process.env.VCAP_SERVICES);
  connectionMongo = env['compose-for-mongodb'][0].credentials.uri;
  connectionCloudant = env['cloudantNoSQLDB'][0].credentials.url;
} else {
  connectionMongo = 'mongodb://127.0.0.1:27017/recipes';
  connectionCloudant = 'https://cf9b83f2-0117-4700-89ad-4ca8da645452-bluemix:b3cd04ae6b0dd24ee896cdb17c5da1fbc8a9651274ffce5285cbc7b2dcb8a796@cf9b83f2-0117-4700-89ad-4ca8da645452-bluemix.cloudant.com'
}

dbMongo.initialize(connectionMongo, err => {
  if (err) {
    console.log('Failed to connect to MongoDB.' + err);
    process.exit(1);
  }

  dbCloudant.initialize(connectionCloudant, (err) => {

    if (err) {
      console.log('Failed to connect to Cloudant.' + err);
      process.exit(1);
    }

    const port = process.env.PORT || 3000
    const mainApp = app(dbMongo, dbCloudant);
    const server = http.createServer(mainApp);

    server.listen(port, () => {
      console.log("To view your app, open this link in your browser: http://localhost:" + port);
    });
  });
});