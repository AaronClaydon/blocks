var block = {};

block.identifier = 'Number';
block.category = 'maths';

block.execute = function(executor, stack, state) {
    return state.value;
};

module.exports = block;
