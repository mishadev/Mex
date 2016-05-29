"use strict";

var _ = require('lodash');

var User = require('./User');
var Categories = require('./Categories');

module.exports = _.flatten([User, Categories]);
