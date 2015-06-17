var block = {};

block.identifier = 'Number';
block.category = 'maths';

block.execute = function(executor, stack, segment) {
    return segment.state.value;
};

module.exports = block;
