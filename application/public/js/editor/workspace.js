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

        //Calls event when workspace has been edited
        this.testWorkspace.addChangeListener(function(e) {
            //Check if we need to disable the prompt simulator block in the test toolbox
            VisualBlocks._workspaces.updateTestToolbox();

            //Check the puzzles steps for block events
            VisualBlocks._workspaces.checkAllTestsBlocks();
        });
        this.appWorkspace.addChangeListener(function(e) {
            //Check the puzzles steps for block events
            result = VisualBlocks._workspaces.checkBlocks(VisualBlocks._workspaces.appWorkspace);
            relevantSteps = result[0];
            relevantStepsResults = result[1];

            //Update all the steps
            for (var stepID = 0; stepID < relevantSteps.length; stepID++) {
                step = relevantSteps[stepID];
                VisualBlocks.puzzlesManager.updateStep(step.id, relevantStepsResults[stepID]);
            }
        });
    };

    this.checkAllTestsBlocks = function() {
        stepsToUpdate = {};

        for (var testID in VisualBlocks.currentPuzzle.tests) {
            if(testID === VisualBlocks.ui.currentTest) {
                testWorkspace = VisualBlocks._workspaces.testWorkspace;
            } else {
                test = VisualBlocks.currentPuzzle.tests[testID];
                testDom = Blockly.Xml.textToDom(test.testCode);
                testWorkspace = new Blockly.Workspace();
                Blockly.Xml.domToWorkspace(testWorkspace, testDom);
            }

            result = VisualBlocks._workspaces.checkBlocks(testWorkspace);
            relevantSteps = result[0];
            relevantStepsResults = result[1];

            //Update all the steps
            for (var stepID = 0; stepID < relevantSteps.length; stepID++) {
                step = relevantSteps[stepID];

                if(stepsToUpdate[step.id] === undefined || !stepsToUpdate[step.id]) {
                    stepsToUpdate[step.id] = relevantStepsResults[stepID];
                }
            }
        }

        for (var stepID in stepsToUpdate) {
            VisualBlocks.puzzlesManager.updateStep(stepID, stepsToUpdate[stepID]);
        }
    }

    //Check the puzzles steps for block events
    this.checkBlocks = function(workspace) {
        var workspaceType = '';
        if(workspace.options.workspaceType === 'application-blockly') {
            workspaceType = 'application';
        } else {
            workspaceType = 'test';
        }

        //Get the relevant steps to compare against
        relevantSteps = [];
        relevantStepsBeenSet = {};
        relevantStepsResults = {};
        for (var i = 0; i < VisualBlocks.currentPuzzle.steps.length; i++) {
            step = VisualBlocks.currentPuzzle.steps[i];
            step.id = i;
            successCondition = step.successCondition;

            if(successCondition !== undefined) {
                if(successCondition.workspace == workspaceType) {
                    //Add to the list of relevant events for blocks
                    if($.inArray(successCondition.event, ['contains_block']) > -1) {
                        relevantSteps.push(step);
                    }
                }
            }
        }

        //Go through all the blocks in the workspace
        if(relevantSteps.length > 0) {
            allBlocks = workspace.getAllBlocks();
            for (var blockID = 0; blockID < allBlocks.length; blockID++) {
                block = allBlocks[blockID];

                //Go througn all block relevant steps
                for (var stepID = 0; stepID < relevantSteps.length; stepID++) {
                    step = relevantSteps[stepID];

                    //Basic event data
                    eventData = {
                        type: block.type
                    };

                    //Block specific event data
                    if(block.type == 'procedures_defreturn') {
                        eventData.function_name = block.getFieldValue('NAME');
                    } else if(block.type == 'procedures_callreturn') {
                        eventData.function_name = block.getFieldValue('NAME');
                    }

                    //If it has already been set as true then we ignore the result of the results
                    if(!relevantStepsBeenSet[stepID]) {
                        //Execute the step equality success condition
                        stepResult = VisualBlocks.puzzlesManager.executeEventEquality(step.successCondition, eventData);

                        relevantStepsResults[stepID] = stepResult;

                        if(stepResult) {
                            relevantStepsBeenSet[stepID] = true;
                        }
                    }
                }
            }
        }

        return [relevantSteps, relevantStepsResults]
    }

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
