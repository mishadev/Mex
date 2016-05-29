"use strict";

// var _ = require("lodash");
var React = require("react");

// var Command = require("../core/Command");
// var Symbols = require("../core/Symbols");
// var Query = require("../core/Query");
var Component = require("../core/Component");

var Header = require("./header/Header.react");
var RouteStore = require("../stores/RouteStore");

var Router = require("../routing/Router");

var Application = Component.Create(RouteStore, {
    getState: function() {
        return {
            route: RouteStore.get("route")
        };
    },

    componentDidMount: function(argument) {
        Router.init();
    },

    render: function() {
        return (<div className="main">
            <Header />
            <div className="view">
                {this.state && this.state.route && <this.state.route.handler />}
            </div>
        </div>);
    }
});

module.exports = Application;
