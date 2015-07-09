var block = {};

block.name = 'Get';
block.category = 'variables';

block.execute = function(executor, stack, state) {
    var value = stack[state.name];

    if(value === undefined)
        throw 'Undefined variable ' + state.name;

    return value;
};

module.exports = block;
