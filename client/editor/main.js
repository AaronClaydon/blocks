var blocks = require('./blocks');
var componentPane = require('./componentPane');
var renderer = require('./renderer');
var executor = require('./executor');

var $ = require('jquery');

// console.log = function(value) {
//     $('#output').append(value + '<br/>');
// };

$.getJSON('/puzzles/test01.json', function(data) {
    //$('#application').html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    executor.run(data);
    renderer.render(data);
});

componentPane.init('#component-pane', blocks.categories());
renderer.init('application-blocks');
