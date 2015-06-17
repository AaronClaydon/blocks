var blocks = require('./blocks');
var componentPane = require('./componentPane');
var executor = require('./executor');

var $ = require('jquery');

$.getJSON('/puzzles/test01.json', function(data) {
    executor.run(data);
});

componentPane.init('#componentPane', blocks.categories());
