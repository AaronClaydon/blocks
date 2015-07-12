var $ = require('jquery');
var blocks = require('./blocks');

var draw;

var renderer = {};
renderer.init = function(id) {
    if (SVG.supported) {
        draw = SVG(id);
    } else {
        alert('SVG not supported - application wont work');
    }
};

renderer.render = function(application) {
    var currentPos = {X: 5, Y: 5};

    try {
        for (var i = 0; i < application.length; i++) {
            var segment = application[i];

            var block = renderer.draw(segment);

            block.nested.move(currentPos.X, currentPos.Y);
            currentPos.Y += block.data.height + 4;
        }
    } catch (e) {
        console.log('RENDER ERROR: ' + e);
    }
}

renderer.draw = function(segment) {
    var block = blocks.loaded[segment.identifier];

    if(block === undefined) {
        throw 'Unknown block type ' + segment.identifier;
    }

    var nested = draw.nested();
    var blockData = block.draw(segment.state, nested);

    return {nested: nested, data: blockData}
}

module.exports = renderer;
