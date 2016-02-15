/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/ignore_next_output.js
**
** Google Blockly custom block for setting the test framework to ignore the next output
*/

//Block definition
Blockly.Blocks['ignore_next_output'] = {
    init: function() {
        this.setColour(Blockly.Blocks.testing.HUE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.appendDummyInput()
            .appendField('ignore next application output');
        this.setTooltip('Ignores and deletes the next application output.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['ignore_next_output'] = function(block) {
    //Don't actually need to compile anything, just used as a config block
    return 'ignoreNextOutput();\n';
};
