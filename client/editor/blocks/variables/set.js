var block = {};
//var executor = require('../../executor');

block.identifier = 'Set';
block.category = 'variables';

block.execute = function(executor, stack, state) {
    var value = executor.parse(stack, state.value);

    stack[state.name] = value;
};

module.exports = block;
