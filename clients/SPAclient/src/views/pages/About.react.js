'use strict';

var React = require('react');
var Component = require("../../core/Component");

var About = Component.Create({
    render: function() {
        return (
            <div className="x">
                <h1>About</h1>
                <h2>Some shit about</h2>
                <a href={this.route().makeHref("default")}>home page</a>
            </div>);
    }
});

module.exports = About;
