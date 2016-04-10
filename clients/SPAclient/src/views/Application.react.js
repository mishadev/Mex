"use strict";

// var _ = require("lodash");
var React = require("react");

// var Command = require("../core/Command");
// var Symbols = require("../core/Symbols");
// var Query = require("../core/Query");
var Component = require("../core/Component");

var Header = require("./header/Header.react");

var Application = Component.Create({
    getState: function() {
        return {};
    },

    render: function() {
        return (<div className="main">
            <Header />
            <div className="view">
            </div>
        </div>);
    }
});

module.exports = Application;
