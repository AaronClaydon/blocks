var block = {};

block.identifier = 'Print';
block.category = 'variables';

block.execute = function(executor, stack, segment) {
    var value = executor.parse(stack, segment.state.value);

    console.log('PRINT ' + value);
};

module.exports = block;
