'use strict';

var Home = require('../views/pages/Home.react');
var About = require("../views/pages/About.react");

var Config = {
    default: { path: '', handler: Home },
    second: { path: "second", handler: About }
};

module.exports = Config;
