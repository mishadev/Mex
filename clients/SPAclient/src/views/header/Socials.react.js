"use strict";

var React = require("react");

var Component = require("../../core/Component");

var Socials = Component.Create({
    render: function() {
        return (<div className="socials">
            <a className="facebook" href="https://www.facebook.com/misha.dev">facebook</a>
            <a className="twitter" href="https://twitter.com/MishaDev">twitter</a>
            <a className="instagram" href="https://www.instagram.com/misho_nak/">instagram</a>
            <a className="youtube" href="https://www.youtube.com/user/misha4dev">youtube</a>
        </div>);
    }
});

module.exports = Socials;
