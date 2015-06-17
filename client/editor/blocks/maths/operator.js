var block = {};

block.identifier = 'Operator';
block.category = 'maths';

block.execute = function(executor, stack, state) {
    var operator = state.operator;
    var value = 0;

    if(state.values.length != 2)
        throw 'Math op values length mismatch';

    var val1 = executor.parse(stack, state.values[0]);;
    var val2 = executor.parse(stack, state.values[1]);;

    if(operator == 'add') {
        value = val1 + val2;
    } else if(operator == 'sub') {
        value = val1 - val2;
    } else if(operator == 'mul') {
        value = val1 * val2;
    } else if(operator == 'div') {
        value = val1 / val2;
    } else {
        throw 'Unknown math op ' + operator;
    }

    return value;
}

module.exports = block;
