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
        var TYPES = [['simulate text prompt input', 'TEXT'], ['simulate number prompt input', 'NUMBER']];

        this.setColour(10);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Simulate the print input for an application prompt.');

        var thisBlock = this;
        var dropdown = new Blockly.FieldDropdown(TYPES, function(newOp) {
            thisBlock._updateType(newOp);
        });
        this.appendValueInput('SIMULATE_INPUT')
            .appendField(dropdown, 'TYPE');
    },

    //Change type of the input depending on dropdown
    _updateType: function(newOp) {
        input = this.inputList[0];

        if (newOp == 'NUMBER') {
            input.setCheck('Number');
        } else {
            input.setCheck('String');
        }
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['simulate_input'] = function(block) {
    //Dont actually need to compile anything for this, it just holds data for the prompt block
    return '';
};
