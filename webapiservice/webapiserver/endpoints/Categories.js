"use strict";

var _ = require("lodash");

var Route = require("../../infrastructure/web/Route");
var ApiResponse = require("../../infrastructure/web/ApiResponse");
var Validation = require("../../infrastructure/utils/Validation");

module.exports = [
    new Route({
        method: "get",
        pattern: "/api/products/categories/",
        handler: function (req, res) {
            console.log('received request!!!');
            console.dir(req.body);

            ApiResponse.success(res, {categories: ["tacos", "burritos", "specialties", "bowl", "breakfast", "drinks", "sides", "vegetarian"]});

            // ViewGateway.categories(function(data) {
            //     ApiResponse.success(res, {categories: data});
            // });
        }
    })
];
