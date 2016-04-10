"use strict";

var Client = require('mongodb').MongoClient;
var Validation = require('../utils/Validation');

var mongoUrl = 'mongodb://' + process.env.STORE_PORT_27017_TCP_ADDR + ':' + process.env.STORE_PORT_27017_TCP_PORT + '/models';

function _getUserInfo(criteria, callback) {
    Client.connect(mongoUrl, function(error, db) {
        console.log("open connection to " + mongoUrl);
        Validation.IsNull(error);

        var collection = db.collection('Users');
        collection.find(criteria).toArray(function(error, result) {
            Validation.IsNull(error);

            db.close();
            console.log("close connection to " + mongoUrl);
            callback(result);
        });
    });
}

function _createUser(data, callback) {
    Client.connect(mongoUrl, function(error, db) {
        console.log("open connection to " + mongoUrl);
        Validation.IsNull(error);

        var collection = db.collection('Users');
        collection.insert(data, function(err, result) {
            Validation.IsNull(error);

            db.close();
            console.log("close connection to " + mongoUrl);
            callback(result);
        });
    });
}

module.exports = {
    getUserInfo: _getUserInfo,
    createUser: _createUser
}
