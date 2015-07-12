var block = {};

block.name = 'Print';
block.category = 'variables';

block.execute = function(executor, stack, state) {
    var value = executor.parse(stack, state.value);

    console.log('PRINT ' + value);
};

block.draw = function(state, nested) {
    var backgroundRect = nested.rect(200, 40);
    backgroundRect.fill('#FFF323');
    backgroundRect.stroke({ width: 0.5, color: 'red' });
    var text = nested.text("Print [###]");

    return {height: 40};
}

module.exports = block;
