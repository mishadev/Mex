#!/usr/bin/env node

var path = require('path');

var debug = require('debug')('assetsservice:server');
var http = require('http');

var ApplicationFactory = require('../../infrastructure/web/ApplicationFactory');

var Validation = require('../../infrastructure/utils/Validation');

var port = +(process.env.PORT || '3000');
Validation.IsTypeOf(port, 'number');

var application = ApplicationFactory.createAssetsApplication(path.join(path.dirname(__dirname), 'assets'));
var server = http.createServer(application.instance());

function _onError(error) {
    if (error.syscall !== 'listen') throw error;

    // handle specific listen errors with friendly messages
    var msg;
    if (error.code === 'EACCES') {
        msg = 'Port ' + port + ' requires elevated privileges';
    } else if (error.code === 'EACCES') {
        msg = 'Port ' + port + ' is already in use';
    }

    if (msg) console.error(msg), process.exit(1);
    else throw error;
}

function _onListening() {
    debug('Listening on ' + server.address().port);
}

server.on('error', _onError);
server.on('listening', _onListening);
server.listen(port);
