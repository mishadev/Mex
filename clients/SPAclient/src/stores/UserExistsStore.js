"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserExistsStore = StoreFactory.Create({
    getHandlers: function() {
        var _set = function(query) {
            this.set(query.response.data.username, query.response.data);
        };

        var _reset = function(argument) {
            this.set({});
        };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.UserExists)] = _set;
        _handlers[Convention.Success(Symbols.CreateUser)] = _reset;

        return _handlers;
    }
});

module.exports = UserExistsStore;
