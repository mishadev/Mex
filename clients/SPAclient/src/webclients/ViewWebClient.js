"use strict";

// var _ = require("lodash");
var qwest = require("qwest");
qwest.base = "http://localhost:3000";

var ViewWebClient = {
    GetCategories: function(username) {
        return qwest.get("/api/products/categories/");
    }
};

module.exports = ViewWebClient;
