'use strict';

// npm
const http = require('http')

// private
const app = require('./lib/app');

var port = process.env.PORT || 3000
const mainApp = app();
const server = http.createServer(mainApp);

var port = process.env.PORT || 3000
server.listen(port, () => {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});