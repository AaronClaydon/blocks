/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/if_prompts_missed.js
**
** Google Blockly custom block for checking if any prompts were not handled
*/

//Block definition
Blockly.Blocks['if_prompts_missed'] = {
    init: function() {
        this.setColour(10);
        this.appendDummyInput()
            .appendField('prompts missed?');
        this.setOutput(true, 'Boolean');
        this.setTooltip('Checks if any prompts were missed and not handled.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['if_prompts_missed'] = function(block) {
    return ['getIfPromptsMissed()', Blockly.JavaScript.ORDER_MEMBER];
};
