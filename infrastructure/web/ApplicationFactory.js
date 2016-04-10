"use strict";

var Validation = require('../utils/Validation');
var ExpressApplication = require('./ExpressApplication');
var Route = require('./Route');

module.exports = {
    createApiApplication: function(routes) {
        Validation.IsArrayOfInstances(routes, Route);

        return new ExpressApplication({ routes: routes });
    },
    createAssetsApplication: function(directory) {
        Validation.IsTypeOf(directory, 'string');

        return new ExpressApplication({ staticDirectory: directory });
    }
};
