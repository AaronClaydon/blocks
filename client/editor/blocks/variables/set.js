var block = {};
//var executor = require('../../executor');

block.identifier = 'Set';
block.category = 'variables';

block.execute = function(executor, stack, segment) {
    var value = executor.parse(stack, segment.state.value);

    stack[segment.state.name] = value;
};

module.exports = block;
