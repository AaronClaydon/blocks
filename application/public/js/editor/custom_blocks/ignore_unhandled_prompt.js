/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/ignore_unhandled_prompt.js
**
** Google Blockly custom block for setting the test framework to ignore any unhandled prompts
*/

//Block definition
Blockly.Blocks['ignore_unhandled_prompt'] = {
    init: function() {
        this.setColour(Blockly.Blocks.testing.HUE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.appendDummyInput()
            .appendField('ignore unhandled prompts');
        this.setTooltip('Asserts whether or not the test was successful or not.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['ignore_unhandled_prompt'] = function(block) {
    //Don't actually need to compile anything, just used as a config block
    return '';
};
