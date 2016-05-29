'use strict';

var React = require('react');
var Component = require("../../core/Component");

var Home = Component.Create({
    render: function() {
        return (
            <div className="x">
                <h1>Home</h1>
                <h2>Some shit</h2>
                <a href={this.route().makeHref("second")}>Another page</a>
            </div>);
    }
});

module.exports = Home;
