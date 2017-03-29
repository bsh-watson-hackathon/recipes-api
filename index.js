'use strict';

// npm
const http = require('http')

// private
const app = require('./lib/app');
const database = require('./lib/database');

const port = process.env.PORT || 3000
const mainApp = app();
const server = http.createServer(mainApp);

let connectionString = null;

if (process.env.VCAP_SERVICES) {
  let env = JSON.parse(process.env.VCAP_SERVICES);
  connectionString = env['compose-for-mongodb'][0].credentials.uri;
} else {
  connectionString = 'mongodb://127.0.0.1:27017/recipes';
}

database.initialize(connectionString, err => {
  if (err) {
    console.log('Failed to connect to database.' + err);
    process.exit(1);
  }
  
  server.listen(port, () => {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
  });
});