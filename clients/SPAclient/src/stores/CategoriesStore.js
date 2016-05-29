"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var CategoriesStore = StoreFactory.Create({
    getHandlers: function () {
        var _set = function(query) {
            this.set("categories", query.response.data.categories);
        };

        var handlers = {};
        handlers[Convention.Success(Symbols.GetCategories)] = _set;

        return handlers;
    }
});

module.exports = CategoriesStore;
