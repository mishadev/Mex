"use strict";

var _ = require("lodash");
var qwest = require("qwest");

var host = "http://localhost:3000";

var ViewWebClient = {
    UserExists: function(username) {
        return qwest.get(
            _.template(host + "/api/user/exists/${username}/")({username: username})
        );
    },
    GetUserToken: function(username, password) {
        return qwest.get(
            _.template(host + "/api/user/token/?un=${username}&pw=${password}")({username: username, password: password})
        );
    }
};

module.exports = ViewWebClient;
