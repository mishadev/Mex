"use strict";

var _ = require("lodash");
var classnames = require("classnames");

var React = require("react");

var Store = require("./Store");

var Validation = require("../utils/Validation");
var RouteStore = require("../stores/RouteStore");

var _empty = _.partial(_.identity, undefined);

function Component(component, stores) {
    Validation.IsTypeOf(component, "object");
    var _component = component;

    Validation.IsArrayOfInstances(stores, Store);
    var _stores = stores;

    this.route = function() { return RouteStore.get("route"); }
    this.css = classnames;

    this._base = function(method, params) {
        return _.get(_component, method, _empty).apply(this, params);
    };

    if (!_.isEmpty(_stores)) {
        _stores = _.union(_stores);

        this.getInitialState = function() {
            return this._base("getInitialState") || this.getState();
        };

        this.componentDidMount = function() {
            for (var idx in _stores) {
                _stores[idx].on(this._onChange);
            }
            this._base("componentDidMount");

            this.componentDidUpdate();
        };

        this.componentWillUnmount = function() {
            this._base("componentWillUnmount");
            for (var idx in _stores) {
                _stores[idx].off(this._onChange);
            }
        };

        this.componentDidUpdate = function() {
            this._base("componentDidUpdate", _.toArray(arguments));
        };

        this.getState = function() {
            return this._base("getState", _.toArray(arguments));
        };

        this._onChange = function() {
            if(this.isMounted()) {
                this._base("_onChange");
                this.setState(this.getState());
            }
        };
    } else {
        this.shouldComponentUpdate = function(nextProp, nextState) {
            var result = this._base("shouldComponentUpdate", _.toArray(arguments));
            if (_.isBoolean(result)) return result;

            return !_.isEqual(nextProp, this.props) || !_.isEqual(nextState, this.state);
        };
    }

    this.isChanged = function isChanged(obj1, obj2, prop) {
        return !_.isEqual(_.get(obj1, prop), _.get(obj2, prop));
    }

    //add if not exists;
    _.defaults(this, _component);
}

Component.Create = function() {
    var component = _.last(arguments),
        stores = _.initial(arguments);

    return React.createClass(new Component(component, stores));
}

module.exports = Component;
