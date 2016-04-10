"use strict";

var qwest = require('qwest');
qwest.setDefaultDataType('json');

var host = "http://localhost:3000";

var ApiWebClient = {
    CreateUser: function(username, password) {
        return qwest.post(host + '/api/users/create', {
            username: username,
            password: password
        });
    }
};

module.exports = ApiWebClient;
