var blocks = require('./blocks');

executor = {};

executor.run = function(application) {
    var stack = {};

    try {
        for (var i = 0; i < application.length; i++) {
            var segment = application[i];

            executor.parse(stack, segment);
        }
    } catch (e) {
        console.log('ERROR: ' + e);
    }

    //console.log('END');
};

executor.parse = function(stack, segment) {
    var block = blocks.loaded[segment.identifier];

    if(block === undefined) {
        throw 'Unknown block type ' + segment.identifier;
    }

    //console.log('stepping in to ' + segment.identifier, stack);
    var value = block.execute(executor, stack, segment.state);
    //console.log('stepping out of ' + segment.identifier, stack);

    return value;
};

module.exports = executor;
