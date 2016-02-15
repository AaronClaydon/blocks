/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/workspace.js
**
** Manages and provides and interface for the Blockly workspaces
*/

function WorkSpaces() {
    //Create and inject a workspace into the UI
    function createWorkspace(area, workspace, toolbox, visible, editable) {
        var blocklyArea = document.getElementById(area);
        var blocklyDiv = document.getElementById(workspace);
        var workspace = Blockly.inject(blocklyDiv, {
            toolbox: document.getElementById(toolbox),
            workspaceType: workspace,
            readOnly: !editable,
            scrollbars: true
        });

        //Set visiiblity of the workspace from options
        workspace.setVisible(visible);

        //Resize the Blockly workspace to fill the browser window
        var onresize = function(e) {
            // Compute the absolute coordinates and dimensions of blocklyArea.
            var element = blocklyArea;
            var x = 0;
            var y = 36;
            do {
                x += element.offsetLeft;
                y += element.offsetTop;
                element = element.offsetParent;
            } while (element);

            // Position blocklyDiv over blocklyArea.
            blocklyDiv.style.left = x + 'px';
            blocklyDiv.style.top = y + 'px';
            blocklyDiv.style.width = (blocklyArea.offsetWidth - 10) + 'px';
            blocklyDiv.style.height = (blocklyArea.offsetHeight - 36) + 'px';
        };
        window.addEventListener('resize', onresize, false);
        onresize();

        return workspace;
    }

    function setTestToolboxBlockDisabled(block, disabled) {
        //No need to do this is the test code isnt editable
        if(!VisualBlocks.currentPuzzle.options.testCodeEditable) {
            return;
        }
        updatedToolbox = $(Blockly.Xml.textToDom($("#blockly-testing-toolbox")[0].outerHTML));
        updatedToolbox.find("block[type=" + block + "]").attr('disabled', disabled);

        VisualBlocks._workspaces.testWorkspace.updateToolbox(updatedToolbox[0].outerHTML);
    }

    //Generates toolboxes and creates the two workspaces
    this.init = function() {
        this.generateToolboxes();

        //Dispose of old workspaces if reloading
        if(this.appWorkspace !== undefined) {
            this.appWorkspace.dispose();
            this.testWorkspace.dispose();
        }

        options = VisualBlocks.currentPuzzle.options;
        this.appWorkspace = createWorkspace('application-panel', 'application-blockly', 'blockly-application-toolbox',
                                            options.applicationCodeVisible, options.applicationCodeEditable);
        this.testWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'blockly-testing-toolbox',
                                            true, options.testCodeEditable);

        this.promptSimulatorDisabled = false;

        //Check if we need to disable the prompt simulator block in the test toolbox
        this.testWorkspace.addChangeListener(function() {
            VisualBlocks._workspaces.updateTestToolbox();
        });
    };

    //Generate Blockly toolboxes by merging type specific and shared toolboxes
    this.generateToolboxes = function() {
        //Get XML from document
        var shared = $("#blockly-shared-toolbox").html();
        var applicationOnly = $("#blockly-application-only-toolbox").html();
        var testOnly = $("#blockly-testing-only-toolbox").html();

        //Merged them together
        var applicationToolbox = shared + applicationOnly;
        var testToolbox = shared + testOnly;

        //Create elements in the DOM with these new toolboxes for Blockly to use
        $('body').append('<xml id="blockly-application-toolbox" style="display: none">' + applicationToolbox + '</xml>');
        $('body').append('<xml id="blockly-testing-toolbox" style="display: none">' + testToolbox + '</xml>');
    };

    //Disables adding any more simulator input blocks if one is already in the workspace
    this.updateTestToolbox = function() {
        //Check if we've got any simulate input blocks
        simulateBlockInWorkspace = false;
        testBlocks = this.testWorkspace.getAllBlocks();
        for (var i = 0; i < testBlocks.length; i++) {
            block = testBlocks[i];

            if(block.type == 'simulate_input') {
                simulateBlockInWorkspace = true;
                break;
            }
        }

        if(simulateBlockInWorkspace && !this.promptSimulatorDisabled) {
            setTestToolboxBlockDisabled('simulate_input', true);
            this.promptSimulatorDisabled = true;
        } else if(!simulateBlockInWorkspace && this.promptSimulatorDisabled) {
            setTestToolboxBlockDisabled('simulate_input', false);
            this.promptSimulatorDisabled = false;
        }
    }

    //Load given code into the application workspace
    this.loadApplication = function(code) {
        this.appWorkspace.clear();
        Blockly.Xml.domToWorkspace(this.appWorkspace, Blockly.Xml.textToDom(code));
    };

    //Load given code into the test workspace
    this.loadTest = function(code) {
        this.testWorkspace.clear();
        Blockly.Xml.domToWorkspace(this.testWorkspace, Blockly.Xml.textToDom(code));
    };
}
