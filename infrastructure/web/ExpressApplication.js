"use strict";

var util = require('util');

var _ = require('lodash');

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var logger = require('morgan');

var Application = require('./Application');
var Route = require('./Route');

var Validation = require('../utils/Validation');

function ExpressApplication(options) {
    Application.call(this)

    var _application = express();

    function _register(route) {
        Validation.IsInstanceOf(route, Route);

        var reg = _application[route.method];
        Validation.IsFunction(reg);

        console.log('register route: method - ' + route.method + ' pattern: ' + route.pattern);
        reg.call(_application, route.pattern, route.handler);
    }

    function _registerRoutes(routes) {
        _.each(routes, _register);
    }

    function _registerDirectory(directory) {
        if(_.isString(directory) && !_.isEmpty(directory)) {
            console.log('register directory: ' + directory);
            _application.use(express.static(directory));
        }
    }

    _application.use(logger('dev'));
    _application.use(bodyParser.json());
    _application.use(bodyParser.urlencoded({ extended: false }));
    _application.use(compression());
    _application.use(function(req, res, next) {
        res.set('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Method', req.get('Access-Control-Request-Method'));
            res.set('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));
            res.set('Access-Control-Max-Age', '1728000');

            return res.sendStatus(200);
        }
        return next();
    });
    _registerDirectory(options.staticDirectory);
    _registerRoutes(options.routes);

    // catch 404 and forward to error handler
    _application.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    //error handler
    _application.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err.stack);
        res.send({
            data: {success: false},
            error: err.message,
            //stack: _application.get('env') === 'development' ? err.stack : {}
            stack: err.stack
        });
    });

    this.instance = function() {
        return _application;
    }
}
util.inherits(ExpressApplication, Application);

module.exports = ExpressApplication;
