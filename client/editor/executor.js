var blocks = require('./blocks');

executor = {};

executor.run = function(application) {
    var stack = {};

    for (var i = 0; i < application.length; i++) {
        var segment = application[i];

        executor.parse(stack, segment);
    }
};

executor.parse = function(stack, segment) {
    var block = blocks.loaded[segment.identifier];

    console.log('stepping in to ' + segment.identifier, stack);
    var value = block.execute(executor, stack, segment);
    console.log('stepping out of ' + segment.identifier, stack);

    return value;
}

module.exports = executor;
