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

        //Display only the app worksapce if the test code is set not to be visible
        if(!puzzle.options.testCodeVisible) {
            VisualBlocks.ui.setVisibleWorkspace('app');
        } else {
            VisualBlocks.ui.setVisibleWorkspace('both');
        }

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

        //Call test updated event, with the number of tests
        VisualBlocks.puzzlesManager.callEvent("update_tests", {
            numTests: Object.keys(VisualBlocks.currentPuzzle.tests).length
        });

        //delete me
        //$("#nav-header-edit-puzzle-steps-btn").click();
        //$("#modal-edit-steps-list .btn-edit")[2].click();
        //$("#modal-edit-steps-add-btn").click();
        //$("#testing-btn-run-all").click();
        VisualBlocks.executor.executeAllTests();
        //$("#nav-header-puzzles-btn").click();
        //$("#modal-save").modal('show');
        //$("#modal-save-publish-btn").click();
    }

    //Load a puzzle from a remote file
    this.loadPuzzleFromFile = function(filename) {
        //Request the JSON object of the puzzle
        $.getJSON(filename, function(data) {
            VisualBlocks.output.writeLine('Loaded puzzle ' + data.name);
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle(data));
        });
    }

    //Create a new workspace puzzle
    this.newWorkspace = function() {
        VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle());
    }

    //Create a new puzzle
    this.newPuzzle = function() {
        VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle({
            isPuzzle: true,
            name: 'New Puzzle',
            description: 'A new empty puzzle',
            options: {}
        }));
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

        //Call test updated event, with the number of tests
        VisualBlocks.puzzlesManager.callEvent("update_tests", {
            numTests: Object.keys(VisualBlocks.currentPuzzle.tests).length
        });
    }

    //Edit/add a given step
    this.editStep = function(id, step) {
        VisualBlocks.currentPuzzle.steps[id] = step;
    }

    //Delete a given step
    this.deleteStep = function(id) {
        deletedOrder = VisualBlocks.currentPuzzle.steps[id].order;
        delete VisualBlocks.currentPuzzle.steps[id];

        //Shift the order of the steps under it down by one
        for (var stepID in VisualBlocks.currentPuzzle.steps) {
            step = VisualBlocks.currentPuzzle.steps[stepID];

            if(step.order > deletedOrder) {
                step.order--;
            }
        }
    }

    //Moves a given step in one direction, updating the other steps as well
    this.moveStep = function(moveStepID, direction) {
        var moveStep = VisualBlocks.currentPuzzle.steps[moveStepID];
        var pivot = moveStep.order;

        //Calculate the new order value for the given step
        var newOrder;
        if(direction === 'up') {
            newOrder = parseInt(moveStep.order) - 1;
        } else if(direction === 'down') {
            newOrder = parseInt(moveStep.order) + 1;
        }

        //Go through all the steps and update the order value of the step being shifted by the given step
        for (var stepID in VisualBlocks.currentPuzzle.steps) {
            var step = VisualBlocks.currentPuzzle.steps[stepID];

            if(direction === 'up') {
                if(step.order == newOrder) {
                    step.order++;
                }
            } else if (direction === 'down') {
                if(step.order == newOrder) {
                    step.order--;
                }
            }
        }

        //Update the given steps order
        moveStep.order = newOrder;
    }

    //Puzzle step event handler
    this.callEvent = function(eventName, eventData) {
        //Check all the steps success condition against the event
        for (var stepID in VisualBlocks.currentPuzzle.steps) {
            step = VisualBlocks.currentPuzzle.steps[stepID];
            successCondition = step.successCondition;

            if(successCondition !== undefined) {
                //If this steps success condition matches this event
                if(successCondition.event == eventName) {
                    //Compare the step equality definiton against the event
                    if(successCondition.equality !== undefined) {
                        result = this.executeEventEquality(successCondition.equality, eventData);

                        //Update the step with the new completed value
                        VisualBlocks.puzzlesManager.updateStep(stepID, result);
                    } else if(eventName === 'branch_coverage') {
                        result = (eventData.numBranches === eventData.numBranchesHit);

                        //Update the step with the new completed value
                        VisualBlocks.puzzlesManager.updateStep(stepID, result);
                    }
                }
            }
        }
    };

    //Execute a step event equality
    this.executeEventEquality = function(equality, eventData) {
        resultSet = false; //if the result value has already been set
        result = false;

        for (var varName in equality) {
            //if the equality is a range - (event value type of number and equality has a ' to ')
            if(!isNaN(eventData[varName]) && equality[varName].indexOf(' to ') > 0) {
                //extract the from and to
                rangeSplit = equality[varName].split(' to ');
                rangeFrom = rangeSplit[0];
                rangeTo = rangeSplit[1];

                //if the equality and event value for this variable are in range
                varResult = (rangeFrom <= eventData[varName] && eventData[varName] <= rangeTo);
            } else {
                //if the equality and event value for this variable match
                varResult = (equality[varName] == eventData[varName]);
            }

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
        step = VisualBlocks.currentPuzzle.steps[stepID];

        //If the step is 'sticky', it cannot be set back to incomplete once it is completed
        if(step.sticky && step.completed) {
            return;
        }

        //Check all prerequisite steps have been completed
        if(step.successCondition.prerequisite !== undefined) {
            for (var i = 0; i < step.successCondition.prerequisite.length; i++) {
                prereqstepid = step.successCondition.prerequisite[i];
                prereqstep = VisualBlocks.currentPuzzle.steps[prereqstepid];

                //Set step as not complete if a prerequisite step is not complete
                if(!prereqstep.completed) {
                    value = false;
                    break;
                }
            }
        }

        //Dont display a notifcation for hidden steps
        if(VisualBlocks.currentPuzzle.steps[stepID].visibility !== 'not_visible') {
            //Display notification if the step is now complete
            if(!VisualBlocks.currentPuzzle.steps[stepID].completed && value) {
                VisualBlocks.ui.displayNotification("'" + VisualBlocks.currentPuzzle.steps[stepID].title + "' complete");
            }
            //Display notification if the step is now incomplete
            if(VisualBlocks.currentPuzzle.steps[stepID].completed && !value) {
                VisualBlocks.ui.displayNotification("'" + VisualBlocks.currentPuzzle.steps[stepID].title + "' no longer complete");
            }
        }

        //console.log("STEP UPDATE", VisualBlocks.currentPuzzle.steps[stepID].title, value);
        VisualBlocks.currentPuzzle.steps[stepID].completed = value;
        VisualBlocks.ui.updateStepsList();

        //Check if puzzle has been completed
        steps = VisualBlocks.currentPuzzle.steps;
        stepsTotal = 0;
        stepsCompleted = 0;

        //Count how many steps completed
        for (var i in steps) {
            if(steps[i].successCondition !== undefined) {
                steps[i].hasSuccessCondition = true;
                stepsTotal++;
            }
            if(steps[i].completed) {
                stepsCompleted++;
            }
        }

        //If all steps are completed, then puzzle is complete
        //Update complete value and display a message to the user
        if(stepsTotal == stepsCompleted) {
            //Only display the puzzle complete alert if the puzzle previously wasnt complete
            if(!VisualBlocks.currentPuzzle.complete) {
                VisualBlocks.ui.puzzleComplete();

                //If puzzle is uniquely identifiable, set it as being complete in user storage
                if(VisualBlocks.currentPuzzle.id) {
                    localStorage.setItem('puzzle_complete_' + VisualBlocks.currentPuzzle.id, true);
                }
            }

            VisualBlocks.currentPuzzle.complete = true;
        } else {
            VisualBlocks.currentPuzzle.complete = false;
        }
    }

    //Encode the puzzle as JSON, ready for saving
    this.encodedPuzzle = function() {
        //really hacky way of copying an object
        savePuzzle = JSON.parse(JSON.stringify(VisualBlocks.currentPuzzle));

        //Delete information we dont need to save
        for (var stepID in savePuzzle.steps) {
            step = savePuzzle.steps[stepID];
            delete step['completed'];
            delete step['hasSuccessCondition'];
            delete step['id'];
        }
        for (var testID in savePuzzle.tests) {
            test = savePuzzle.tests[testID];
            delete test['formattedResult'];
            delete test['result'];
        }
        delete savePuzzle.complete;

        //Encode the puzzle as json and return it
        puzzleJSON = JSON.stringify(savePuzzle, null, 4);
        return puzzleJSON;
    }
}

//Hold puzzle data
function Puzzle(content) {
    //allow default values if not loading from file
    if(content === undefined) {
        content = {};
        content.options = {};
    }
    if(content.id) {
        this.id = content.id;
    }
    this.name = content.name || 'New Workspace';
    this.description = content.description || 'A new empty workspace';
    this.isPuzzle = content.isPuzzle || false;
    this.isPublished = content.isPublished || false;
    this.steps = content.steps || {};
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
            testCodeVisible: opt.testCodeVisible !== false,
            testCodeEditable: opt.testCodeEditable !== false,
            testListEditable: opt.testListEditable !== false
        };
    }
}
