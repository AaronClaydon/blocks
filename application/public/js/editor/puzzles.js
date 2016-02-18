/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/puzzles.js
**
** Manages the currently loaded puzzle
*/

function PuzzlesManager() {
    //Load a puzzle object as the current puzzle
    this.loadPuzzle = function(puzzle) {
        //Set it as current
        VisualBlocks.currentPuzzle = puzzle;

        //Init Blockly workspace
        VisualBlocks._workspaces.init();

        //Load the application code
        VisualBlocks._workspaces.loadApplication(puzzle.applicationCode);

        //Update puzzle name in UI
        VisualBlocks.ui.updatePuzzleName();
        //Generate the tests menu
        VisualBlocks.ui.updateTestSelectionDropdown();
        //Generate the steps UI
        VisualBlocks.ui.updateStepsList();

        //Load the first test
        firstTestID = Object.keys(VisualBlocks.currentPuzzle.tests)[0];
        VisualBlocks.puzzlesManager.loadTest(firstTestID);
    }

    //Load a puzzle from a remote file
    this.loadPuzzleFromFile = function(filename) {
        //Request the JSON object of the puzzle
        $.getJSON(filename, function(data) {
            VisualBlocks.output.writeLine('Loaded remote puzzle ' + data.name + ' from ' + filename);
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle(data));
        });
    }

    //Load a given test into the test editor panel
    this.loadTest = function(id) {
        test = VisualBlocks.currentPuzzle.tests[id];

        //Set current test id
        VisualBlocks.ui.currentTest = id;

        //Update test panel UI
        VisualBlocks.ui.updateTestPanelName();

        //Load the code to the Blockly workspace
        VisualBlocks._workspaces.loadTest(test.testCode);
    };

    this.updateCurrentApplication = function() {
        VisualBlocks.currentPuzzle.applicationCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(VisualBlocks._workspaces.appWorkspace));
    }

    //Update the current puzzle with any changes to the current test
    this.updateCurrentTest = function() {
        VisualBlocks.currentPuzzle.tests[VisualBlocks.ui.currentTest].testCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(VisualBlocks._workspaces.testWorkspace));
    }

    //Add a new empty test to the puzzle
    this.newTest = function(name) {
        uid = Blockly.genUid();

        VisualBlocks.currentPuzzle.tests[uid] = {
            'name': name,
            'testCode': '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
        };

        //Call test created event, with the test name
        VisualBlocks.puzzlesManager.callEvent("create_test", {
            name: name
        });
        //Call test updated event, with the number of tests
        VisualBlocks.puzzlesManager.callEvent("update_tests", {
            numTests: Object.keys(VisualBlocks.currentPuzzle.tests).length
        });

        return uid;
    }

    //Deletes a given test
    this.deleteTest = function(id) {
        delete VisualBlocks.currentPuzzle.tests[id];
    }

    //Puzzle step event handler
    this.callEvent = function(eventName, eventData) {
        //Check all the steps success condition against the event
        for (var i = 0; i < VisualBlocks.currentPuzzle.steps.length; i++) {
            step = VisualBlocks.currentPuzzle.steps[i];
            successCondition = step.successCondition;

            if(successCondition !== undefined) {
                //If this steps success condition matches this event
                if(successCondition.event == eventName) {
                    //Compare the step equality definiton against the event
                    if(successCondition.equality !== undefined) {
                        result = this.executeEventEquality(successCondition, eventData);

                        //Update the step with the new completed value
                        VisualBlocks.puzzlesManager.updateStep(i, result);
                    }
                }
            }
        }
    };

    //Execute a step event equality
    this.executeEventEquality = function(successCondition, eventData) {
        equality = successCondition.equality;

        resultSet = false; //if the result value has already been set
        result = false;

        for (var varName in equality) {
            //if the equality and event value for this variable match
            varResult = (equality[varName] == eventData[varName]);

            //Only update the result if the result hasnt been set or if changing to false
            if(!resultSet || (result && !varResult)) {
                result = varResult;
                resultSet = true;
            }
        }

        return result;
    };

    //Update the step completed value
    this.updateStep = function(stepID, value) {
        console.log("STEP UPDATE", VisualBlocks.currentPuzzle.steps[stepID].title, value);
        VisualBlocks.currentPuzzle.steps[stepID].completed = value;
        VisualBlocks.ui.updateStepsList();

        //Check if puzzle has been completed
        steps = VisualBlocks.currentPuzzle.steps;
        stepsTotal = 0;
        stepsCompleted = 0;

        //Count how many steps completed
        for (var i = 0; i < steps.length; i++) {
            if(steps[i].successCondition !== undefined) {
                steps[i].hasSuccessCondition = true;
                stepsTotal++;
            }
            if(steps[i].completed) {
                stepsCompleted++;
            }
        }

        //If all steps are completed, then puzzle is complete
        if(stepsTotal == stepsCompleted) {
            alert("PUZZLE COMPLETE");
        }
    }
}

//Hold puzzle data
function Puzzle(content) {
    //allow default values if not loading from file
    if(content === undefined) {
        content = {};
        content.options = {};
    }
    this.name = content.name || 'New Puzzle';
    this.description = content.description || 'A new empty puzzle';
    this.steps = content.steps || [];
    this.applicationCode = content.applicationCode || '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
    this.tests = content.tests || {'defaul1': {
        'name': 'Test 1',
        'testCode': '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
    }};

    this.options = _parseOptions(content.options);

    function _parseOptions(opt) {
        //Default options values
        return {
            //All defaults are true
            applicationCodeVisible: opt.applicationCodeVisible !== false,
            applicationCodeEditable: opt.applicationCodeEditable !== false,
            testCodeEditable: opt.testCodeEditable !== false,
            testListEditable: opt.testListEditable !== false
        };
    }
}
