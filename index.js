'use strict';

// npm
const http = require('http')

// private
const app = require('./lib/app');

const port = 3000;
const mainApp = app();
const server = http.createServer(mainApp);

server.listen(port, () => {
  console.log('Server listening on port 3000...');
});