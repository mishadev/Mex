'use strict';

var _ = require('lodash');

var crossroads = require('crossroads');

var Command = require("../core/Command");
var Symbols = require("../core/Symbols");

var Config = require('./Config');


var _normalize = function(request, values) {
    return _.pick(values, function(value, key) { return !_.endsWith(key, '_') && !/\d+/.test(key); });
};

function BaseRouter(options) {
    var _options = _.defaults({}, options, { shouldTypecast: true, ignoreCase: true, normalize: _normalize });
    var _routes = {};

    var _onRouteChanged = function(route, name, values) {
        var params = _.omit(values, '?query'),
            query = values['?query'];

        route.name = name;
        route.params = params;
        route.query = query || {};

        Command(Symbols.ChangeRoute, route);
    };

    var _notFount = function(path) {
        throw "404 not fount!";
    };

    this.makePath = function(name, parameters) {
        return _routes[name].interpolate(parameters);
    }

    this.parse = function (path) {
        crossroads.parse(path);
    };

    this.registerRoute = function(route, name) {
        return crossroads.addRoute(route.path + ':?query:', _onRouteChanged.bind(this, route, name));
    };

    this.init = function() {
        _routes = _.mapValues(Config, this.registerRoute.bind(this));
        //NOTE: logging
        crossroads.routed.add(console.log, console);
        //NOTE: /logging
        crossroads.shouldTypecast = _options.shouldTypecast;
        crossroads.ignoreCase = _options.ignoreCase;
        crossroads.normalizeFn = _options.normalize;
        crossroads.bypassed.add(_notFount);
        //NOTE: logging
        crossroads.bypassed.add(console.log, console);
        //NOTE: /logging
    };
}

module.exports = BaseRouter;
