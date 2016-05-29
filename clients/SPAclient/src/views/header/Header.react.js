"use strict";

// var _ = require("lodash");
var React = require("react");

var Component = require("../../core/Component");

var Navigation = require("./Navigation.react");
var Socials = require("./Socials.react");
var Categories = require("./Categories.react");

var Header = Component.Create({
    render: function() {
        return (<header className="header-container">
            <div className="header">
                <Navigation />
                <a className="logo" href="/">Mex</a>
                <Socials />
            </div>
            <Categories />
        </header>);
    }
});

module.exports = Header;
