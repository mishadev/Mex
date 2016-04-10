"use strict";

var _ = require("lodash");

var Symbols = [
    "CreateUser",

    "UserExists",
    "GetUserToken"
];

module.exports = _.mapKeys(Symbols, _.indentity);
