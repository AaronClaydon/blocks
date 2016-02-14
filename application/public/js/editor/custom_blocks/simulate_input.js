/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/custom_blocks/simulate_input.js
**
** Google Blockly custom block for setting the application input for prompts
*/

//Block definition
Blockly.Blocks['simulate_input'] = {
    init: function() {
        this.setColour(10);
        this.appendValueInput('SIMULATE_INPUT')
            .setCheck('Number')
            .appendField('set prompt input');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Set the print input for an application prompt.');
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['simulate_input'] = function(block) {
    //Dont actually need to compile anything for this, it just holds data for the prompt block
    return '';
};
