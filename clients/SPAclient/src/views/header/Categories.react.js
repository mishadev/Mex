"use strict";

var _ = require("lodash");
var React = require("react");

var Component = require("../../core/Component");
var Symbols = require("../../core/Symbols");

var Query = require("../../core/Query");

var CategoriesStore = require("../../stores/CategoriesStore");

var Categories = Component.Create(CategoriesStore, {
    componentDidUpdate: function(props, state) {
        if(!CategoriesStore.has("categories")) {
            Query(Symbols.GetCategories);
        }
    },

    getState: function(argument) {
        return {
            categories: CategoriesStore.get("categories")
        };
    },

    render: function() {
        return (<div className="categories">
                {this.state && _.map(this.state.categories, function(category) {
                    return <div className="category">{category}</div>
                })}
            </div>);
    }
});

module.exports = Categories;
