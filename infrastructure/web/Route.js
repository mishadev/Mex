"use strict";

var Validation = require('../utils/Validation');

function Route(route) {
    Validation.IsTypeOf(route, 'string', ['pattern', 'method']);
    Validation.IsFunction(route, ['handler']);

    this.pattern = route.pattern;
    this.method = route.method;
    this.handler = route.handler;
}

module.exports = Route;
