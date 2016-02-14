/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** ONLY FOR TESTING THE EDITOR - NOT FOR ACTUAL USE
*/

//Block definition
Blockly.Blocks['console_output'] = {
    init: function() {
        this.setColour(10);
        this.appendValueInput('ASSERT_SUCCESS_VALUE')
            .setCheck('String')
            .appendField('[dont use me]console.log');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Gets the print output from an application.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['console_output'] = function(block) {
    var value = Blockly.JavaScript.valueToCode(block, 'ASSERT_SUCCESS_VALUE', Blockly.JavaScript.ORDER_NONE);

    return 'consolelog(' + value + ');\n';
};
