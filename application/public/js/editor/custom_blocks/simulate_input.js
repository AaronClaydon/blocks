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
        this.setColour(Blockly.Blocks.testing.HUE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Simulate the print input for an application prompt.');

        this._itemCount = 3;
        this._updateShape();
        this.setMutator(new Blockly.Mutator(['simulate_input_with_item']));
    },
    //Redraw the block with the new length/input
    _updateShape: function() {
        // Delete everything.
        if (this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else {
            var i = 0;
            while (this.getInput('ADD' + i)) {
                this.removeInput('ADD' + i);
                i++;
            }
        }
        // Rebuild block.
        if (this._itemCount == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
        } else {
            for (var i = 0; i < this._itemCount; i++) {
                var input = this.appendValueInput('ADD' + i);
                if (i == 0) {
                    input.appendField('simulate prompt input with');
                }
            }
        }
    },
    //Create XML to represent the inputs
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('items', this._itemCount);
        return container;
    },
    //Parse the input XML
    domToMutation: function(xmlElement) {
        this._itemCount = parseInt(xmlElement.getAttribute('items'), 10);
        this._updateShape();
    },
    //Populate the mutator's dialog with this block's components.
    decompose: function(workspace) {
        var containerBlock = workspace.newBlock('simulate_input_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this._itemCount; i++) {
            var itemBlock = workspace.newBlock('simulate_input_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    //Reconfigure this block based on the mutator dialog's components.
    compose: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
        }
        this._itemCount = connections.length;
        this._updateShape();
        // Reconnect any child blocks.
        for (var i = 0; i < this._itemCount; i++) {
            if (connections[i]) {
                this.getInput('ADD' + i).connection.connect(connections[i]);
            }
        }
    },
    //Store pointers to any connected child blocks.
    saveConnections: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
        }
    }
};

//Mutator block for edit input container
Blockly.Blocks['simulate_input_with_container'] = {
    init: function() {
        this.setColour(Blockly.Blocks.testing.HUE);
        this.appendDummyInput()
            .appendField('inputs');
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
        this.contextMenu = false;
    }
};

//Mutator block for adding inputs
Blockly.Blocks['simulate_input_with_item'] = {
    init: function() {
        this.setColour(Blockly.Blocks.testing.HUE);
        this.appendDummyInput()
            .appendField('input');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Add an input to the simulation list.');
        this.contextMenu = false;
    }
};

//Block JavaScript code compiler
Blockly.JavaScript['simulate_input'] = function(block) {
    //Dont actually need to compile anything for this, it just holds data for the prompt block
    return '';
};
