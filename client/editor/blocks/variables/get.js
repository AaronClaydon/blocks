var block = {};

block.identifier = 'Get';
block.category = 'variables';

block.execute = function(executor, stack, segment) {
    return stack[segment.state.name];
}

module.exports = block;
