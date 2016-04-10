"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserInfoStore = StoreFactory.Create({
    getHandlers: function() {
        var _set = function(query) {
            this.set(query.response);
        };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.UserInfo)] = _set;

        return _handlers;
    }
});

module.exports = UserInfoStore;
