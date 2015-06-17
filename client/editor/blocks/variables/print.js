var block = {};

block.identifier = 'Print';
block.category = 'variables';

block.execute = function(executor, stack, state) {
    var value = executor.parse(stack, state.value);

    console.log('PRINT ' + value);
};

module.exports = block;
