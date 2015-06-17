var blocks = require('./blocks');
var componentPane = require('./componentPane');
var executor = require('./executor');

var $ = require('jquery');

console.log = function(value) {
    $("#output").append(value + '<br/>');
};

$.getJSON('/puzzles/test01.json', function(data) {
    $("#application").text(JSON.stringify(data));
    executor.run(data);
});

componentPane.init('#componentPane', blocks.categories());
