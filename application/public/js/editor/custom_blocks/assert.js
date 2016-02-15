/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/assert.js
**
** Google Blockly custom block for assertions
*/

Blockly.Blocks.testing = {};
Blockly.Blocks.testing.HUE = 10;

//Block definition
Blockly.Blocks['assert'] = {
    init: function() {
        this.setColour(Blockly.Blocks.testing.HUE);
        this.appendValueInput('ASSERT_SUCCESS_VALUE')
            .setCheck('Boolean')
            .appendField('assert test success as');
        this.appendValueInput('ASSERT_SUCCESS_IF')
            .setCheck('Boolean')
            .appendField('if')
            .setAlign(Blockly.ALIGN_RIGHT);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Asserts whether or not the test was successful or not.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['assert'] = function(block) {
    var value = Blockly.JavaScript.valueToCode(block, 'ASSERT_SUCCESS_VALUE', Blockly.JavaScript.ORDER_NONE);
    var check_if = Blockly.JavaScript.valueToCode(block, 'ASSERT_SUCCESS_IF', Blockly.JavaScript.ORDER_NONE);

    return 'assert(' + value + ', ' + check_if + ');\n';
};
