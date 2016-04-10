"use strict";

var ApiResponse = {
    success: function(res, data) {
        res.status(200);
        res.send({ data: data || { success: true }, error: null });
    },
    badRequest: function(res, error) {
        res.status(400);
        res.send({ data: { success: false }, error: error });
    }
};

module.exports = ApiResponse;
