"use strict";

var qwest = require("qwest");
qwest.setDefaultDataType("json");
qwest.base = "http://localhost:3000";

var ApiWebClient = {
    CreateUser: function(username, password) {
        return qwest.post("/api/users/create", {
            username: username,
            password: password
        });
    }
};

module.exports = ApiWebClient;
