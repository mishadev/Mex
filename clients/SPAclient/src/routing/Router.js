'use strict';

var _ = require('lodash');

var BaseRouter = require("../routing/BaseRouter");

var hasher = require("hasher");
var history = require("history");

function HashRouter() {
    BaseRouter.call(this);

    var _extendRoute = function (route) {
        var _makePath = this.makePath;

        route.makeHref = function(name, parameters) {
            return '#' + hasher.prependHash + _makePath(name, parameters);
        };

        route.transitionTo = function(name, parameters) {
            hasher.setHash(_makePath(name, parameters));
        };
    }

    var _registerRoute = this.registerRoute;
    this.registerRoute = function (route, name) {
        _extendRoute.call(this, route);
        return _registerRoute.call(this, route, name);
    }

    var _init = this.init;
    this.init = function(argument) {
        _init.call(this);

        hasher.initialized.add(this.parse);
        hasher.changed.add(this.parse);
        hasher.init();
    }
}

HashRouter.prototype = _.create(BaseRouter.prototype, {
    "constructor": HashRouter
});

function HistoryRouter () {
    BaseRouter.call(this);

    var _history;
    var _init = this.init;
    var _registerRoute = this.registerRoute;

    var _extendRoute = function (route) {
        var _makePath = this.makePath;

        _history.listen(function(location) {
            console.log(JSON.stringify(location));
        });

        route.makeHref = function(name, parameters) {
            return '/' + _makePath(name, parameters);
        };

        route.transitionTo = function(name, parameters) {
            var path = _makePath(name, parameters);
            _history.push(path);
        };
    }

    this.registerRoute = function (route, name) {
        _extendRoute.call(this, route);
        return _registerRoute.call(this, route, name);
    }

    this.init = function(argument) {
        _init.call(this);

        _history = history();
    }
}

HistoryRouter.prototype = _.create(BaseRouter.prototype, {
    "constructor": HistoryRouter
});

module.exports = new HistoryRouter();
