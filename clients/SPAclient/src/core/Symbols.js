"use strict";

var _ = require("lodash");

var Symbols = [
    "ChangeRoute",
    "GetCategories"
];

module.exports = _.mapKeys(Symbols, _.indentity);
