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
            media: '/blockly_media/',
            toolbox: document.getElementById(toolbox),
            workspaceType: workspace,
            readOnly: !editable,
            scrollbars: true
        });

        //Set visiiblity of the workspace from options
        workspace.setVisible(visible);

        //Resize the worksapce to fit the panel it is in
        var onresize = function() {
            panel = $(blocklyArea);
            space = $(blocklyDiv);

            space.height(panel.height() - panel.find(".panel-heading").outerHeight() + 1);
            space.width(panel.width() + 1);
        }
        $(window).resize(onresize);
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

    //Load the reserved names for variables and function
    this.loadReservedWords = function() {
        var reservedWords = ['highlightBlock', 'updatedVariable', 'assert', 'getNextOutput', 'getIfOutputsLeft', 'getIfPromptsMissed', 'ignoreNextOutput', 'updatedVariable'];

        for (var i = 0; i < reservedWords.length; i++) {
            Blockly.JavaScript.addReservedWords(reservedWords[i]);
        }

        //Alows us to highlight the currently being executed block
        Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    }

    //Generates toolboxes and creates the two workspaces
    this.init = function() {
        this.generateToolboxes();

        //Dispose of old workspaces if reloading
        if(this.appWorkspace !== undefined) {
            this.appWorkspace.dispose();
            this.testWorkspace.dispose();
        }

        isPublished = VisualBlocks.currentPuzzle.isPublished;
        options = VisualBlocks.currentPuzzle.options;
        this.appWorkspace = createWorkspace('application-panel', 'application-blockly', 'blockly-application-toolbox',
                                            options.applicationCodeVisible || !isPublished, options.applicationCodeEditable || !isPublished);
        this.testWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'blockly-testing-toolbox',
                                            options.testCodeVisible || !isPublished, options.testCodeEditable || !isPublished);

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
        for (var i in VisualBlocks.currentPuzzle.steps) {
            step = VisualBlocks.currentPuzzle.steps[i];
            step.id = i;
            successCondition = step.successCondition;

            if(successCondition !== undefined) {
                if(successCondition.workspace == workspaceType) {
                    //Add to the list of relevant events for blocks
                    if($.inArray(successCondition.event, ['contains_block', 'block_has_input']) > -1) {
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
                    stepResult = undefined;

                    //If it has already been set as true then we ignore the result of the results
                    if(!relevantStepsBeenSet[stepID]) {
                        //Basic event data
                        eventData = this.getBlockEventData(block);
                        if(step.successCondition.event === 'contains_block') {
                            //Execute the step equality success condition
                            stepResult = VisualBlocks.puzzlesManager.executeEventEquality(step.successCondition.equality, eventData);

                            relevantStepsResults[stepID] = stepResult;
                            if(stepResult) {
                                relevantStepsBeenSet[stepID] = true;
                            }
                        } else if(step.successCondition.event === 'block_has_input') {
                            parentEqualityResult = VisualBlocks.puzzlesManager.executeEventEquality(step.successCondition.parent, eventData);

                            if(parentEqualityResult) {
                                inputEqualityResult = this.recursiveBlockInputCheck(block, step.successCondition.input);

                                relevantStepsResults[stepID] = inputEqualityResult;
                                if(inputEqualityResult) {
                                    relevantStepsBeenSet[stepID] = true;
                                }
                            }
                        } else {
                            console.log('STEP ERROR: UNHANDLED EVENT', step.successCondition.event);
                        }
                    }
                }
            }
        }

        return [relevantSteps, relevantStepsResults]
    }

    //Get data that describes the block, type, names, etc
    this.getBlockEventData = function(block) {
        //Basic event data
        eventData = {
            type: block.type
        };

        //Block specific event data
        if(block.type == 'procedures_defreturn' || block.type == 'procedures_callreturn'
            || block.type == 'procedures_defnoreturn' || block.type == 'procedures_callnoreturn') {
            eventData.function_name = block.getFieldValue('NAME');
        } else if(block.type === 'variables_get' || block.type === 'variables_set') {
            eventData.variable_name = block.getFieldValue('VAR');
        } else if(block.type == 'math_number') {
            eventData.value = block.getFieldValue('NUM');
        } else if(block.type == 'text') {
            eventData.value = block.getFieldValue('TEXT');
        } else if(block.type == 'simulate_input') {
            eventData.numInputs = block.inputList.length;
        } else if(block.type == 'lists_create_with') {
            eventData.numItems = block.inputList.length;
        } else if(block.type == 'logic_compare') {
            eventData.logicCompareOperator = block.getFieldValue('OP');
        } else if(block.type == 'logic_operation') {
            eventData.logicOperation = block.getFieldValue('OP');
        } else if(block.type == 'logic_boolean') {
            eventData.logicBooleanValue = block.getFieldValue('BOOL');
        } else if(block.type == 'math_arithmetic') {
            eventData.mathArtithmeticOperator = block.getFieldValue('OP');
        } else if(block.type == 'math_single') {
            eventData.mathSingleOperator = block.getFieldValue('OP');
        } else if(block.type == 'math_trig') {
            eventData.mathTrigOperator = block.getFieldValue('OP');
        } else if(block.type == 'math_number_property') {
            eventData.mathNumberProperty = block.getFieldValue('PROPERTY');
        }

        return eventData;
    }

    //Check if any of the blocks inputs, and the inputs for the input, match a certain equality
    this.recursiveBlockInputCheck = function(block, equality) {
        //Get all inputs for this block
        for (var inputID in block.inputList) {
            inputBlockConnection = block.inputList[inputID].connection

            //If this input references another block
            if(inputBlockConnection !== null) {
                inputBlock = inputBlockConnection.targetBlock();
                if(inputBlock !== null) {
                    eventData = this.getBlockEventData(inputBlock);

                    //Check if equality matches the input
                    inputEqualityResult = VisualBlocks.puzzlesManager.executeEventEquality(equality, eventData);

                    //Return true if matches, else recursively check again
                    if(inputEqualityResult) {
                        return true;
                    } else {
                        //check if child input is successful and end the search
                        recur_success = this.recursiveBlockInputCheck(inputBlock, equality);

                        if(recur_success) {
                            return true;
                        }
                    }
                }
            }
        }
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
