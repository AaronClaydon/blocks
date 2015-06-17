var block = {};

block.identifier = 'Get';
block.category = 'variables';

block.execute = function(executor, stack, segment) {
    var value = stack[segment.state.name];

    if(value === undefined)
        throw 'Undefined variable ' + segment.state.name;    

    return value;
}

module.exports = block;
