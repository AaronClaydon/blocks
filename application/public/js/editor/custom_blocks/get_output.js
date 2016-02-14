/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/get_output.js
**
** Google Blockly custom block for getting the application output (print) in a test
*/

//Block definition
Blockly.Blocks['get_output'] = {
    init: function() {
        this.setColour(10);
        this.appendDummyInput()
            .appendField('get next application output');
        this.setOutput(true, 'String');
        this.setTooltip('Gets the print output from an application.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['get_output'] = function(block) {
    return ['getNextOutput()', Blockly.JavaScript.ORDER_MEMBER];
};
