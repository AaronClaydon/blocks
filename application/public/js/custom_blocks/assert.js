Blockly.Blocks['assert'] = {
    init: function() {
        this.setColour(10);
        this.appendValueInput('ASSERT_SUCCESS_VALUE')
            .setCheck('Boolean')
            .appendField('assert test success as');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Asserts whether or not the test was successful or not.');
    }
};

Blockly.JavaScript['assert'] = function(block) {
    var argument0 = Blockly.JavaScript.valueToCode(block, 'ASSERT_SUCCESS_VALUE', Blockly.JavaScript.ORDER_NONE) || '\'\'';
    return 'window.alert("ASSERT: " + (' + argument0 + '));\n';
};
