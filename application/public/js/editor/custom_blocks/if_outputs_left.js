/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/if_outputs_left.js
**
** Google Blockly custom block for checking if any outputs are left
*/

//Block definition
Blockly.Blocks['if_outputs_left'] = {
    init: function() {
        this.setColour(10);
        this.appendDummyInput()
            .appendField('outputs left?');
        this.setOutput(true, 'Boolean');
        this.setTooltip('Checks if any outputs are left.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['if_outputs_left'] = function(block) {
    return ['getIfOutputsLeft()', Blockly.JavaScript.ORDER_MEMBER];
};
