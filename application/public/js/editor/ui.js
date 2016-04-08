/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/ui.js
**
** Manages dynamic UI elements
*/

function UI() {
    this.isMobile = false;
    this.visibleWorkspace = 'both';
    this.outputExpanded = true;

    //Details about the step events
    var block_variables = {
        "type": {
            name: "Block Type"
        },
        "function_name": {
            name: "Function Name",
            onTypeSet: "procedures"
        },
        "variable_name": {
            name: "Variable Name",
            onTypeSet: "variables"
        },
        "value": {
            name: "Value",
            onTypeSet: "values"
        },
        "numInputs": {
            name: "Number of Inputs",
            onType: "simulate_input"
        },
        "numItems": {
            name: "Number of Items",
            onType: "lists_create_with"
        },
        "logicCompareOperator": {
            name: "Operator",
            values: {
                "EQ": "=",
                "NEQ": "\u2260",
                "LT": "<",
                "LTE": "\u2264",
                "GT": ">",
                "GTE": "\u2265"
            },
            onType: "logic_compare"
        },
        "logicOperation": {
            name: "Operation",
            values: {
                "AND": "AND",
                "OR": "OR"
            },
            onType: "logic_operation"
        },
        "logicBooleanValue": {
            name: "Value",
            values: {
                "TRUE": "TRUE",
                "FALSE": "FALSE"
            },
            onType: "logic_boolean"
        },
        "mathArtithmeticOperator": {
            name: "Operation",
            values: {
                "ADD": "+",
                "MINUS": "-",
                "MULTIPLY": "×",
                "DIVIDE": "÷",
                "POWER": "^"
            },
            onType: "math_arithmetic"
        },
        "mathSingleOperator": {
            name: "Operation",
            values: {
                "ROOT": "square root",
                "ABS": "absolute",
                "NEG": "-",
                "LN": "ln",
                "LOG10": "log10",
                "EXP": "e^",
                "POW10": "10^"
            },
            onType: "math_single"
        },
        "mathTrigOperator": {
            name: "Operation",
            values: {
                "SIN": "sin",
                "COS": "cos",
                "TAN": "tan",
                "ASIN": "asin",
                "ACOS": "acos",
                "ATAN": "atan"
            },
            onType: "math_trig"
        },
        "mathNumberProperty": {
            name: "Property",
            values: {
                "EVEN": "even",
                "ODD": "odd",
                "PRIME": "prime",
                "WHOLE": "whole",
                "POSITIVE": "positive",
                "NEGATIVE": "negative",
                "DIVISIBLE_BY": "divisible by"
            },
            onType: "math_number_property"
        }
    };
    var event_definitions = {
        "none": {
            name: "None",
        },
        "contains_block": {
            name: "Contains Block",
            specific_workspace: true,
            equalities: {
                "equality": {
                    name: "Block",
                    variables: block_variables
                }
            }
        },
        "block_has_input": {
            name: "Contains Block with Input",
            specific_workspace: true,
            equalities: {
                "parent": {
                    name: "Block",
                    variables: block_variables
                },
                "input": {
                    name: "Input",
                    variables: block_variables
                }
            }
        },
        "update_tests": {
            name: "Test List Updated",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Test List",
                    variables: {
                        "numTests": {
                            name: "Number of Tests"
                        }
                    }
                }
            }
        },
        "tests_result": {
            name: "Test Results",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Test Results",
                    variables: {
                        "numTests": {
                            name: "Number of Tests"
                        },
                        "numPassed": {
                            name: "Number of Tests Passed"
                        },
                        "allPassed": {
                            name: "All Tests Passed",
                            values: {
                                "TRUE": "True",
                                "FALSE": "FALSE"
                            }
                        }
                    }
                }
            }
        },
        "print_output": {
            name: "Print output",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Text",
                    variables: {
                        "string": {
                            name: "Output String"
                        }
                    }
                }
            }
        },
        "final_variable_value": {
            name: "Final variable value",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Variable",
                    variables: {
                        "name": {
                            name: "Name"
                        },
                        "variable_type": {
                            name: "Type",
                            values: {
                                "number": "Number",
                                "string": "String"
                            }
                        },
                        "value": {
                            name: "Value"
                        }
                    }
                }
            }
        },
        "branch_coverage": {
            name: "All Branches Covered",
            specific_workspace: false
        },
        "code_evaluation": {
            name: "Code Evaluation",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Evaluation",
                    variables: {
                        "expression": {
                            name: "Expression"
                        }
                    }
                }
            }
        }
    };

    function showEditTestsList() {
        $("#modal-tests-edit-list").modal('show');

        //Generate the list of tests
        function generateTestsList() {
            //Put the formatted test result html in the test object for the template
            var renderedTests = VisualBlocks.currentPuzzle.tests;
            for (var testID in renderedTests) {
                renderedTests[testID].result = VisualBlocks.ui.formatTestResult(testID);
            }

            //Render and set the test list in the edit modal
            $("#modal-tests-edit-tests-list").html(VisualBlocks.ui.renderTemplate("edit-tests-list", {
                tests: renderedTests,
                allowDelete: (Object.keys(VisualBlocks.currentPuzzle.tests).length > 1)
            }));

            //Create the event bindings for pressing the delete button
            $("#modal-tests-edit-list .btn-delete").click(function() {
                id = $(this).attr('data-id');

                VisualBlocks.puzzlesManager.deleteTest(id);

                VisualBlocks.ui.updateTestSelectionDropdown();
                generateTestsList();

                //If we just deleted are currently opened test we open another one
                if(id == VisualBlocks.ui.currentTest) {
                    VisualBlocks.puzzlesManager.loadTest(Object.keys(VisualBlocks.currentPuzzle.tests)[0]);
                }
            });

            //Create the event bindings for pressing the edit button
            $("#modal-tests-edit-list .btn-edit").click(function() {
                id = $(this).attr('data-id');
                test = VisualBlocks.currentPuzzle.tests[id];

                $("#input-tests-edit-id").val(id);
                $("#input-tests-edit-name").val(test.name);

                $("#modal-tests-edit-list").modal('hide');
                $("#modal-tests-edit").modal('show');
            });
        }
        generateTestsList();
    }

    function editPuzzleStepListUI() {
        //create an array of the steps ordered by their order value
        var steps = VisualBlocks.currentPuzzle.steps;
        var orderedSteps = [];
        for (var stepID in steps) {
            step = steps[stepID];
            step.id = stepID;
            orderedSteps[step.order] = step;
        }

        $("#modal-edit-steps-data").html(VisualBlocks.ui.renderTemplate("edit-puzzle-steps-list", {steps: orderedSteps}));
        $("#modal-edit-steps-list").modal('show');

        //Change step order button
        $("#modal-edit-steps-list .btn-order").click(function() {
            id = $(this).attr('data-id');
            direction = $(this).attr('data-direction');

            VisualBlocks.puzzlesManager.moveStep(id, direction);

            //Redraw the step list
            editPuzzleStepListUI();

            //Refresh the step list UI
            VisualBlocks.ui.updateStepsList();
        });

        //Edit step button
        $("#modal-edit-steps-list .btn-edit").click(function() {
            id = $(this).attr('data-id');

            //Hacky way of copying the step object, so we dont actually make any changes to it until we save
            editStep = JSON.parse(JSON.stringify(VisualBlocks.currentPuzzle.steps[id]));

            editPuzzleStepUI(editStep, id);
        });

        //Delete step button
        $("#modal-edit-steps-list .btn-delete").click(function() {
            id = $(this).attr('data-id');

            //delete the step
            VisualBlocks.puzzlesManager.deleteStep(id);
            //redraw the step list
            editPuzzleStepListUI();

            //Refresh the step list UI
            VisualBlocks.ui.updateStepsList();
        });
    }

    function editPuzzleStepUI(step, id) {
        //Set this as the currently being edited step
        VisualBlocks.ui.currentEditStep = step;

        function editPuzzleStepEqualityUI(eventType) {
            html = "";

            //Only render the success condition html if the type is not none
            if(eventType !== "none") {
                //Get all the function & variable names defined in the application workspace
                appBlocks = VisualBlocks._workspaces.appWorkspace.getAllBlocks();
                functionNames = [];
                variableNames = [];
                for (var i = 0; i < appBlocks.length; i++) {
                    appBlock = appBlocks[i];
                    if(appBlock.type === 'procedures_defreturn' || appBlock.type === 'procedures_defnoreturn') {
                        functionNames.push(appBlock.getFieldValue('NAME'));
                    } else if(appBlock.type === 'variables_set') {
                        variableNames.push(appBlock.getFieldValue('VAR'));
                    }
                }

                //Render the success condition config ui
                html = VisualBlocks.ui.renderTemplate("edit-puzzle-steps-edit-success-condition", {
                    event_definition: event_definitions[eventType],
                    step: VisualBlocks.ui.currentEditStep,
                    id: id,
                    functionNames: functionNames,
                    variableNames: variableNames
                })
            }

            //Render the success form in the modal
            $("#modal-edit-steps-edit-body-success-condition").html(html);

            //Update the equality variable list if the block type has changed
            $("#modal-edit-steps-edit-body-success-condition .event-step-equality-block-type-value").change(function() {
                //Update the value in the currently being edited step object
                VisualBlocks.ui.currentEditStep = constructStepData();

                editPuzzleStepEqualityUI(eventType);
            });

            //Select block type button click
            $("#modal-edit-steps-edit-body-success-condition .event-step-equality-block-type-btn").click(function() {
                //Show the select block type modal
                $("#modal-edit-steps-select-block").modal('show');
                equality = $(this).attr('data-equality');
                variable = $(this).attr('data-variable');

                //Event fired when a block has been selected
                VisualBlocks.ui.selectedBlockEvent = function(value) {
                    //Update the type hidden field
                    $("#event-step-equality-value-" + equality + "-" + variable).val(value).trigger('change');
                }

                return false;
            });
        }

        //Show the edit puzzle modal
        $("#modal-edit-steps-list").modal('hide');
        $("#modal-edit-steps-edit").modal('show');

        //Cancel button pressed
        $("#modal-edit-steps-edit-cancel-btn").click(function() {
            $("#modal-edit-steps-list").modal('show');
            $("#modal-edit-steps-edit").modal('hide');
        });

        //Construct the body of the modal with the step data and the list of event definitions
        $("#modal-edit-steps-edit-body").html(VisualBlocks.ui.renderTemplate("edit-puzzle-steps-edit", {
            event_definitions: event_definitions,
            step: step,
            id: id
        }));

        //When the success condition type has changed we update the success condition form
        $("#edit-puzzle-step-success-event").change(function() {
            editPuzzleStepEqualityUI($(this).val());
        });

        //Show the event data form
        $("#edit-puzzle-step-success-event").change();
    }

    function constructStepData() {
        stepID = $("#edit-puzzle-step-id").val();

        successCondition = {};
        successEvent = $("#edit-puzzle-step-success-event").val();

        //Construct the step data
        step = {
            title: $("#edit-puzzle-step-title").val(),
            description: $("#edit-puzzle-step-description").val(),
            visibility: $("#edit-puzzle-step-visibility").val(),
            order: $("#edit-puzzle-step-order").val(),
            sticky: $("#edit-puzzle-step-sticky").is(':checked'),
            id: stepID
        };

        //Event has no success condition
        if(successEvent !== "none") {
            //Get the event definition for this type
            event_definition = event_definitions[successEvent];
            successCondition.event = successEvent;

            //Set the workspace of this event type needs one
            if(event_definition.specific_workspace) {
                successCondition.workspace = $("#edit-puzzle-step-success-workspace").val();
            }

            //Go through all the equalities in the event definition
            for (var equalityID in event_definition.equalities) {
                equality = event_definition.equalities[equalityID];
                equalityValues = {};

                //All the variables in this equality definition
                for (var variableID in equality.variables) {
                    //Equality variable name
                    variable = equality.variables[variableID];
                    //Variable value the user has given
                    variableValue = $("#event-step-equality-value-" + equalityID + "-" + variableID).val();

                    //If the variable value is blank we dont add it to the definition
                    if(variableValue !== undefined && variableValue !== "") {
                        equalityValues[variableID] = variableValue;
                    }
                }

                //Add the equality to the success condition
                successCondition[equalityID] = equalityValues;
            }

            //Add any prerequisites
            preReqs = $("#edit-puzzle-step-success-prereq").val();
            if(preReqs !== null) {
                successCondition.prerequisite = preReqs;
            }

            //Add the success condition data to the step
            step.successCondition = successCondition;
        }

        return step;
    }

    //Scale the UI and set window resize events
    this.init = function() {
        //Custom handlebars function for if comparison
        Handlebars.registerHelper('if_eq', function(a, b, opts) {
            if(a == b) // Or === depending on your needs
            return opts.fn(this);
            else
            return opts.inverse(this);
        });

        //Custom handlebars function for if comparison, add third parameter to b
        Handlebars.registerHelper('if_eq_math', function(a, b, x, opts) {
            if(a == (b + x)) // Or === depending on your needs
            return opts.fn(this);
            else
            return opts.inverse(this);
        });

        //Custom handlebars function for providing a list of an event equality variables and step values
        Handlebars.registerHelper('step_equality_values', function(key, step, equality, options) {
            var ret = "";

            //Get the currently set values for the equality variables
            //If there isnt one then we make the list empty
            if(step.successCondition === undefined || step.successCondition[key] === undefined) {
                setVariables = {};
            } else {
                setVariables = step.successCondition[key];
            }

            //Go through all the equality variables
            for (var variableID in equality.variables) {
                variable = equality.variables[variableID];

                //if we are displaying this variable
                display = true;

                //If the variable has the value of type
                if(equality.variables.type !== undefined) {
                    //Only display this variable if the block type matches
                    if(variable.onType) {
                        display = (variable.onType === setVariables.type)
                    //Only display this variable if the block type is in this set
                    } else if(variable.onTypeSet) {
                        set = '';

                        //Work out what set this block type is in
                        if(setVariables.type === 'procedures_defreturn' || setVariables.type === 'procedures_callreturn'
                            || setVariables.type === 'procedures_defnoreturn' || setVariables.type === 'procedures_callnoreturn') {
                            set = 'procedures';
                        } else if(setVariables.type === 'variables_set' || setVariables.type === 'variables_get') {
                            set = 'variables';
                        } else if(setVariables.type === 'text' || setVariables.type === 'math_number') {
                            set = 'values';
                        }

                        //If the actual set matches the equality set
                        display = (variable.onTypeSet === set);
                    }
                }

                //Only add this variable to the return if we are displaying it
                if(display) {
                    //Return the variable name, current value, and the equality
                    ret += options.fn({
                        variableID: variableID,
                        variable: variable,
                        value: setVariables[variableID],
                        equality: key
                    });
                }
            }

            return ret;
        });

        //Custom handlebars function for providing a list of steps and selecting them if they are a prerequisite for a given step
        Handlebars.registerHelper('step_prereq', function(givenStep, givenID, options) {
            var ret = "";

            //Iterate through all the steps in the puzzle
            for (var stepID in VisualBlocks.currentPuzzle.steps) {
                step = VisualBlocks.currentPuzzle.steps[stepID];

                //Cant have a prerequisite step that can never be a success
                //Cant have itself as a prerequisite step
                if(step.successCondition !== undefined && stepID !== givenID) {
                    isSelected = false;
                    if(givenStep.successCondition !== undefined && givenStep.successCondition.prerequisite !== undefined) {
                        //If the current step is a prerequisite of the given step we make it selected
                        isSelected = ($.inArray(stepID, givenStep.successCondition.prerequisite) > -1);
                    }

                    //Add to the list of steps
                    ret += options.fn({
                        step: step,
                        id: stepID,
                        selected: isSelected
                    });
                }
            }

            return ret;
        });

        //New empty workspace modal button
        $("#modal-new-btn").click(function() {
            VisualBlocks.puzzlesManager.newWorkspace();
            VisualBlocks.output.clear();
        });

        //New puzzle modal button
        $("#modal-new-puzzle-btn").click(function() {
            VisualBlocks.puzzlesManager.newPuzzle();
            VisualBlocks.output.clear();
        });

        //Save puzzle locally modal button
        $("#modal-save-locally-btn").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentApplication();
            VisualBlocks.puzzlesManager.updateCurrentTest();

            //Check if user suports the file reading api's
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var encodedPuzzle = VisualBlocks.puzzlesManager.encodedPuzzle();

                //Create a file of the encoded puzzle and save it
                var blob = new Blob([encodedPuzzle], {type: "application/json;charset=utf-8"});
                var fileName = VisualBlocks.currentPuzzle.name + '.vbpuz';
                saveAs(blob, fileName);

                VisualBlocks.output.writeLine('Puzzle ' + VisualBlocks.currentPuzzle.name + ' has been saved as ' + fileName);
            } else {
                alert('Sorry your browser does not support saving files to your computer');
            }
        });

        //Save puzzle remotely (publish) modal button
        $("#modal-save-publish-btn").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentApplication();
            VisualBlocks.puzzlesManager.updateCurrentTest();

            var encodedPuzzle = VisualBlocks.puzzlesManager.encodedPuzzle();

            //Send puzzle to server to be uploaded
            $.ajax({
                type: 'POST',
                url: '/publish_puzzle',
                data: {puzzle: encodedPuzzle},
                success: function(reply) {
                    //URL the editor is at
                    baseUrl = window.location.href;

                    //If the url doesn't end in / add on so the puzzle URL is correct
                    if(window.location.href[window.location.href.length-1] !== '/') {
                        baseUrl += '/';
                    }

                    //Display the published puzzle URL on the screen
                    $("#modal-save-publish-url").html(VisualBlocks.ui.renderTemplate("modal-save-publish-url", {
                        baseurl: baseUrl,
                        id: reply
                    }));
                }
            });
        });

        //Puzzle list navigation button
        $("#nav-header-puzzles-btn").click(function() {
            $("#modal-puzzles").modal('show');

            $.ajax({
                url: '/puzzles_list.json'
            }).done(function(data) {
                puzzles = JSON.parse(data);
                VisualBlocks.ui.puzzlesList = puzzles;

                //Check if the puzzles have been completed by the user
                for (var i = 0; i < puzzles.length; i++) {
                    var puzzle = puzzles[i];

                    if(puzzle.id && localStorage.getItem('puzzle_complete_' + puzzle.id)) {
                        puzzle.completed = true;
                    }
                }

                function drawList(puzzleID) {
                    $("#modal-puzzles-body").html(VisualBlocks.ui.renderTemplate("modal-puzzles-body", {
                        puzzles: puzzles,
                        currentPuzzleID: puzzleID,
                        currentPuzzle: puzzles[puzzleID]
                    }));

                    $("#modal-puzzles-body li").click(function() {
                        key = $(this).attr("data-key");

                        drawList(key);
                    });
                }

                drawList(0);
            });
        });

        //Load puzzle button
        $("#modal-load-puzzle-btn").click(function() {
            var puzzleID = $("#modal-puzzles-selected").val();
            var puzzle = VisualBlocks.ui.puzzlesList[puzzleID];

            VisualBlocks.puzzlesManager.loadPuzzleFromFile(puzzle.fileName);
            $("#modal-puzzles").modal('hide');
        });

        //Load puzzle locally modal button
        $("#modal-load-locally-btn").click(function() {
            //Check if the user supports the file reading api's
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                //Simulate click on file input element to open the load dialog
                $("#header-load-fileInput").click();
            } else {
                alert('Sorry your browser does not support loading files from your computer');
            }
        });

        //Edit puzzle header button
        $("#nav-header-edit-puzzle-btn").click(function() {
            $("#modal-edit-puzzle-data").html(VisualBlocks.ui.renderTemplate("edit-puzzle-data", VisualBlocks.currentPuzzle));
            $("#modal-edit-puzzle").modal('show');
        });

        //Edit puzzle data save button
        $("#modal-edit-puzzle-data-save-btn").click(function() {
            //Update the current puzzle data with the form changes
            VisualBlocks.currentPuzzle.name = $("#edit-puzzle-name").val();
            VisualBlocks.currentPuzzle.description = $("#edit-puzzle-description").val();
            VisualBlocks.currentPuzzle.options = {
                applicationCodeVisible: $("#edit-puzzle-opt-applicationvisible").is(':checked'),
                applicationCodeEditable: $("#edit-puzzle-opt-applicationeditable").is(':checked'),
                testCodeVisible: $("#edit-puzzle-opt-testvisible").is(':checked'),
                testCodeEditable: $("#edit-puzzle-opt-testcodeeditable").is(':checked'),
                testListEditable: $("#edit-puzzle-opt-testlisteditable").is(':checked')
            };

            VisualBlocks.ui.updatePuzzleName();
            $("#modal-edit-puzzle").modal('hide');
        });

        //Edit puzzle steps header button
        $("#nav-header-edit-puzzle-steps-btn").click(function() {
            editPuzzleStepListUI();
        });

        //Edit puzzle steps add new step button
        $("#modal-edit-steps-add-btn").click(function() {
            id = Blockly.genUid(); //generate a unique id for this step
            editPuzzleStepUI({order: Object.keys(VisualBlocks.currentPuzzle.steps).length}, id);
        });

        //Edit puzzle step save button
        $("#modal-edit-steps-edit-save-btn").click(function() {
            stepID = $("#edit-puzzle-step-id").val();

            step = constructStepData();

            //Save the step data to the current puzzle
            VisualBlocks.puzzlesManager.editStep(stepID, step);

            //Show the edit puzzle list modal
            $("#modal-edit-steps-edit").modal('hide');
            editPuzzleStepListUI();

            //Force a step data refresh
            if(step.successCondition === undefined) {
                //just updates the steps list ui
                VisualBlocks.ui.updateStepsList();
            } else {
                //This gives it the has success condition value and updates the ui
                VisualBlocks.puzzlesManager.updateStep(stepID, false);
            }
        });

        //Load puzzle remotely (published) modal button
        $("#modal-load-publish-btn").click(function() {
            alert('Currently not implemented');
        });

        //When a user selects a puzzle file to open
        $("#header-load-fileInput").change(function() {
            var file = $(this)[0].files[0];
            var fileReader = new FileReader();

            fileReader.onload = function(e) {
                var contents = e.target.result; //File contents

                try {
                    //Hide the load puzzle modal
                    $("#modal-load").modal('hide');

                    //Parse puzzle json and load it
                    var puzzle = JSON.parse(contents);
                    VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle(puzzle));

                    VisualBlocks.output.writeLine('Loaded local puzzle ' + puzzle.name + ' from ' + file.name);
                }
                catch(err) {
                    console.log('FAILED TO LOAD PUZZLE', err);
                    alert('Failed to load the Puzzle File\n\n\n\n' + err);
                }
            };
            fileReader.readAsText(file);
        });

        //Application code run button
        $("#application-btn-run").click(function() {
            VisualBlocks.executor.executeApplication();
        });

        //Test code run button
        $("#testing-btn-run").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentTest();
            VisualBlocks.executor.resetTestExecutionData();

            VisualBlocks.executor.executeTest(VisualBlocks.ui.currentTest);

            VisualBlocks.ui.outputTestResults();
        });

        //Test run all button
        $("#testing-btn-run-all").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentTest();
            VisualBlocks.executor.resetTestExecutionData();

            VisualBlocks.executor.executeAllTests();

            VisualBlocks.ui.outputTestResults();
        });

        //Clear output button
        $("#output-btn-clear").click(function() {
            VisualBlocks.output.clear();
        });

        //Save modal update puzzle name
        $("#inputSavePuzzleName").change(function() {
            VisualBlocks.currentPuzzle.name = $(this).val();
            VisualBlocks.ui.updatePuzzleName();
        });

        //Create new test modal add button
        $("#modal-tests-new-btn").click(function() {
            var name = $("#input-tests-new-name").val();

            //Validate the input to see if its empty
            if(!name.trim()) {
                alert('Please enter a test name');
            } else {
                testNumber = VisualBlocks.puzzlesManager.newTest(name);
                VisualBlocks.ui.updateTestSelectionDropdown();
                $("#modal-tests-new").modal('hide');

                //Update the current workspace with any changes to the current test
                VisualBlocks.puzzlesManager.updateCurrentTest();

                //Load the newly created test
                VisualBlocks.puzzlesManager.loadTest(testNumber);
            }
        });
        //Create new test modal cancel button
        $("#modal-tests-new-cancel-btn").click(function() {
            $("#input-tests-new-name").val('');
        });

        //Canceling edit test window brings back the edit list
        $("#modal-tests-edit-cancel-btn").click(function() {
            $("#modal-tests-edit-list").modal('show');
        });

        //Edit test submit button
        $("#modal-tests-edit-btn").click(function() {
            id = $("#input-tests-edit-id").val();
            name = $("#input-tests-edit-name").val();

            //Validate the input to see if its empty
            if(!name.trim()) {
                alert('Please enter a test name');
            } else {
                VisualBlocks.currentPuzzle.tests[id].name = name;

                VisualBlocks.ui.updateTestPanelName();

                $("#modal-tests-edit").modal('hide');

                showEditTestsList();
            }
        });

        //Select block type modal events
        //Create a blockly workspace once the modal is shown
        $("#modal-edit-steps-select-block").on('shown.bs.modal', function() {
            //Create the blockly workspace
            var workspace = Blockly.inject($("#modal-edit-steps-select-block-body")[0], {
                media: 'blockly_media/',
                toolbox: document.getElementById('blockly-testing-toolbox'),
                workspaceType: 'application-blockly',
                trashcan: false,
                scrollbars: false
            });

            //Load it with some procedure definitions so we can select a call block
            Blockly.Xml.domToWorkspace(workspace, Blockly.Xml.textToDom('<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"procedures_defnoreturn\" x=\"-500\" y=\"-500\"><field name=\"NAME\">do something</field><comment pinned=\"false\" h=\"80\" w=\"160\">Describe this function...</comment></block><block type=\"procedures_defreturn\" x=\"-500\" y=\"-500\"><field name=\"NAME\">do something return</field><comment pinned=\"false\" h=\"80\" w=\"160\">Describe this function...</comment></block></xml>'));

            //Tracks number of times the change listener is called
            updateCount = 0;
            //Called when a block has been selected
            workspace.addChangeListener(function(e) {
                //Make the toolbox wider to hide the default procedure blocks
                $(workspace.toolbox_.HtmlDiv).find('.blocklyTreeRoot').width(160);

                //Ignore the first update - thats default blocks
                if(updateCount == 1) {
                    //Get the block type and send it back to the caller through the select event
                    blockType = workspace.getAllBlocks()[2].type; //Index 2 is the new block
                    VisualBlocks.ui.selectedBlockEvent(blockType);

                    //Hide the modal
                    $("#modal-edit-steps-select-block").modal('hide');
                }

                updateCount++;
            });

            //Make the toolbox at the front
            $(workspace.toolbox_.HtmlDiv).css('z-index', 9999);

            VisualBlocks._workspaces.selectBlockWorkspace = workspace;
        })
        .on('hide.bs.modal', function() {
            //Clear the event
            VisualBlocks.ui.selectedBlockEvent = function() {};
            //Dispose of the blockly workspace when the modal is being hidden
            VisualBlocks._workspaces.selectBlockWorkspace.dispose();
        });

        //Resize the output panel to users window size
        function outputResize() {
            var newHeight = $("#output-panel").height() - 35;
            $("#output").css('max-height', newHeight);
        }
        $(window).resize(outputResize);
        outputResize();

        //Load the users dimension settings
        VisualBlocks.ui.loadWorkspaceDimensions();

        //Resizing the workspace and output panels
        interact('#application-panel')
            .resizable({
                edges: { left: false, right: true, bottom: false, top: false }
            })
            .on('resizemove', function (event) {
                var target = event.target;
                //Calculate the current app panel width as a percentage
                appPanelWidth = ($("#application-panel").width() / $(".main-panels").outerWidth()) * 100;
                //Calculate the modifier that we're resizing by
                modifierPercent = event.rect.right / ($("#application-panel").outerWidth() + 10);
                //Calculate the new widths
                newAppPanelWidth = (appPanelWidth * modifierPercent) - 10;
                newTestPanelWidth = 80 - newAppPanelWidth;

                //Constraints on the sizing
                if(newAppPanelWidth > 5 && newAppPanelWidth < 70) {
                    $("#application-panel").width(newAppPanelWidth + "%");
                    $("#testing-panel").width(newTestPanelWidth + "%");

                    //Set the new user dimension settings
                    localStorage.setItem('app_panel_width', newAppPanelWidth);
                    localStorage.setItem('testing_panel_width', newTestPanelWidth);
                }

                //Force the blockly interface to updates its size
                window.dispatchEvent(new Event('resize'));
            });

        //Resize the output panel
        interact('#output-panel')
            .resizable({
                edges: { left: false, right: false, bottom: false, top: true }
            })
            .on('resizemove', function (event) {
                var target = event.target;
                //Calculate the current main panel height as a percentage
                mainPanelsHeight = ($(".main-panels").outerHeight() / $(".main").height()) * 100;
                //Calculate the modifier that we're resizing by
                modifierPercent = event.rect.top / ($(".main-panels").outerHeight() + 70);
                //Calculate the new heights
                newMainPanelsHeight = mainPanelsHeight * modifierPercent;
                newOutputPanelHeight = 90 - newMainPanelsHeight;

                //Constraints on the sizing
                if(newMainPanelsHeight > 10 && newOutputPanelHeight > 2) {
                    $(".main-panels").height(newMainPanelsHeight + "%");
                    $(".output-panel").height(newOutputPanelHeight + "%");

                    //Set the new user dimension settings
                    localStorage.setItem('main_panel_height', newMainPanelsHeight);
                    localStorage.setItem('output_panel_height', newOutputPanelHeight);
                }

                //Force the blockly interface to update its size
                window.dispatchEvent(new Event('resize'));
            });

        //Once the workspaces have loaded, check if the device is a mobile
        VisualBlocks.ui.mobileCheck();

        //Output panel toggle button
        $('#output-panel-collapse-toggle').click(function() {
            VisualBlocks.ui.toggleCollapseOutputPanel();
        });
    };

    //Check if this is a mobile device
    //Mobile devices only display one workspace at a time
    this.mobileCheck = function() {
        //Check using responsive CSS
        if($('#mobile-detect').css('display')=='none') {
            VisualBlocks.ui.isMobile = true;

            this.setVisibleWorkspace('app');

            //Switch workspace button
            $(".ui-switch-workspace").css('display', 'inline-block');
            $(".ui-switch-workspace").click(function() {
                if(VisualBlocks.ui.visibleWorkspace === 'app') {
                    VisualBlocks.ui.setVisibleWorkspace('test');
                } else {
                    VisualBlocks.ui.setVisibleWorkspace('app');
                }
            });
        }
    }

    //This function allows you to select which workspace is visible
    this.setVisibleWorkspace = function(workspace) {
        VisualBlocks.ui.visibleWorkspace = workspace;

        //Make the given workspace fullscreen and hide the other one
        if(workspace === 'app') {
            $("#application-panel").css("display", "block");
            $("#application-panel").width("90%");
            $("#testing-panel").css("display", "none");
        } else if(workspace === 'test') {
            $("#testing-panel").css("display", "block");
            $("#testing-panel").width("90%");
            $("#application-panel").css("display", "none");
        } else if(workspace === 'both') {
            $("#application-panel").css("display", "block");
            $("#testing-panel").css("display", "block");
            this.loadWorkspaceDimensions();
        }

        //Force all dynamic sizing events to update
        window.dispatchEvent(new Event('resize'));
    }

    //Toggles the collapse state of the output panel
    this.toggleCollapseOutputPanel = function() {
        var toggleButton = $('#output-panel-collapse-toggle');
        var outputPanel = $(".output-panel");
        var mainPanels = $(".main-panels");
        toggleButton.removeClass();

        if(this.outputExpanded) {
            toggleButton.addClass('output-panel-collapse-toggle-closed');
            outputPanel.height(outputPanel.find(".panel-heading").outerHeight());
            outputPanel.find(".panel-body").css('display', 'none');
            mainPanels.height("calc(100% - " + outputPanel.outerHeight() + "px)");
        } else {
            toggleButton.addClass('output-panel-collapse-toggle-open');
            outputPanel.find(".panel-body").css('display', 'block');
            outputPanel.height((localStorage.getItem('output_panel_height') || "15") + "%");
            mainPanels.height((localStorage.getItem('main_panel_height') || "75") + "%");
        }

        //Force all dynamic sizing events to update
        window.dispatchEvent(new Event('resize'));

        this.outputExpanded = !this.outputExpanded;
    }

    //Renders a given template with view data
    this.renderTemplate = function(templateName, view) {
        var template = $("#template-" + templateName).html();
        var render = Handlebars.compile(template);
        return render(view);
    }

    //Update puzzle name in places where it is displayed
    this.updatePuzzleName = function() {
        var name = VisualBlocks.currentPuzzle.name;

        $("#application-current-name").text(name);
        $("#inputSavePuzzleName").val(name);
    };

    //Update the tests panel title
    this.updateTestPanelName = function () {
        $("#testing-current-name").text(test.name);
    };

    //Update the tests panel selection dropdown
    this.updateTestSelectionDropdown = function () {
        //Render dropdown template with current puzzle data
        $("#testing-select-menu").html(this.renderTemplate("testing-select-menu", {
            puzzle: VisualBlocks.currentPuzzle,
            testListEditable: VisualBlocks.currentPuzzle.options.testListEditable || !VisualBlocks.currentPuzzle.isPublished
        }));

        //Bind click event on test list
        $(".testing-dropdown-test-name").click(function() {
            id = $(this).attr('data-id');

            $("#testing-dropdownMenu").dropdown('toggle');

            //Update the current workspace with any changes to the current test
            VisualBlocks.puzzlesManager.updateCurrentTest();

            VisualBlocks.puzzlesManager.loadTest(id);
            return false;
        });

        //Dropdown edit tests button
        $("#testing-dropdown-edit").click(function() {
            showEditTestsList();
        });

        //Dropdown new test button
        $("#testing-dropdown-new").click(function() {
            $("#modal-tests-new").modal('show');

            //Create a default test name
            $("#input-tests-new-name").val('Test ' + (Object.keys(VisualBlocks.currentPuzzle.tests).length + 1));
        });
    };

    //Formats the test result
    this.formatTestResult = function(testID) {
        return VisualBlocks.ui.renderTemplate("test-formatted-output", VisualBlocks.executor.testExecution.results[testID]);
    }

    //Format and display the test results in the output panel
    this.outputTestResults = function() {
        //Spacing break line is not needed if output is empty
        VisualBlocks.output.lineBreakIfEmpty();

        renderedTests = VisualBlocks.currentPuzzle.tests;
        numPassed = 0;
        numTests = Object.keys(VisualBlocks.currentPuzzle.tests).length;

        //Put the formatted test result html in the test object for the template
        for (var testID in renderedTests) {
            test = VisualBlocks.currentPuzzle.tests[testID];
            test.formattedResult = VisualBlocks.ui.formatTestResult(testID);

            testResult = VisualBlocks.executor.testExecution.results[testID];

            //Count number of tests passed
            if(testResult.success) {
                numPassed += 1; //Add to count of num tests passed
            }
        }

        //Render the test results in the output pane
        VisualBlocks.output.writeLine(VisualBlocks.ui.renderTemplate("tests-runall-output", {
            tests: renderedTests,
            numTests: numTests,
            numPassed: numPassed
        }));

        //Check if all tests have been passed
        var allTestsPassed;
        if(numTests > 0 && numTests === numPassed) {
            allTestsPassed = "TRUE";
        } else {
            allTestsPassed = "FALSE";
        }

        //Call test results event, with test results - shouldn't really be in ui
        VisualBlocks.puzzlesManager.callEvent("tests_result", {
            numTests: numTests,
            numPassed: numPassed,
            allPassed: allTestsPassed
        });

        //handle inspect link click
        $(".testing-results-table-test-inspect").click(function() {
            testID = $(this).attr('data-id');

            test = VisualBlocks.currentPuzzle.tests[testID];
            result = VisualBlocks.executor.testExecution.results[testID];

            $("#modal-test-execute-inspect-data").html(VisualBlocks.ui.renderTemplate("test-execute-inspect", {
                test: test,
                result: result
            }));
            $("#modal-test-execute-inspect").modal('show');
        });
    };

    //Format the steps list UI and button
    this.updateStepsList = function() {
        //Display steps button if this is a puzzle
        if(VisualBlocks.currentPuzzle.isPuzzle) {
            $("#nav-header-steps-btn").css('display', 'block');
        } else {
            $("#nav-header-steps-btn").css('display', 'none');
        }

        //Hide the save button if this is a puzzle
        if(VisualBlocks.currentPuzzle.isPuzzle && VisualBlocks.currentPuzzle.isPublished) {
            $("#nav-header-save").css('display', 'none');
        } else {
            $("#nav-header-save").css('display', 'block');
        }

        //Display edit puzzle & steps button if this is a unpublished puzzle
        if(VisualBlocks.currentPuzzle.isPuzzle && !VisualBlocks.currentPuzzle.isPublished) {
            $(".nav-header-edit-puzzle").css('display', 'block');
        } else {
            $(".nav-header-edit-puzzle").css('display', 'none');
        }

        //Calculate the progress
        steps = JSON.parse(JSON.stringify(VisualBlocks.currentPuzzle.steps)); //hacky copy method
        stepsTotal = 0;
        stepsCompleted = 0;
        orderedSteps = [];

        //Count how many steps completed and order them
        for (var stepID in steps) {
            step = steps[stepID];
            //we dont count hidden steps
            if(step.visibility !== 'not_visible') {
                if(step.successCondition !== undefined) {
                    step.hasSuccessCondition = true;
                    stepsTotal++;
                }
                if(step.completed) {
                    stepsCompleted++;
                }

                //hide step detils if step not complete and its a visible_on_success
                step.display_details = !(step.visibility === 'visible_on_success' && !step.completed);

                orderedSteps[step.order] = step;
            }
        }

        stepsPercent = (stepsCompleted / stepsTotal) * 100;

        //Render the steps list in the modal
        $("#modal-steps-list").html(VisualBlocks.ui.renderTemplate("steps-list", {
            steps: orderedSteps,
            progress: {
                display: (stepsTotal > 0),
                completed: stepsCompleted,
                total: stepsTotal,
                percent: stepsPercent
            }
        }));
    };

    //Load the users dimension settings
    this.loadWorkspaceDimensions = function() {
        if(localStorage.getItem('app_panel_width')) {
            $("#application-panel").width(localStorage.getItem('app_panel_width') + "%");
            $("#testing-panel").width(localStorage.getItem('testing_panel_width') + "%");
            $(".main-panels").height(localStorage.getItem('main_panel_height') + "%");
            $(".output-panel").height(localStorage.getItem('output_panel_height') + "%");
        } else {
            //Defaults
            $("#application-panel").width("40%");
            $("#testing-panel").width("40%");
            $(".main-panels").height("74%");
            $(".output-panel").height("16%");
        }
    };

    //Reset the users resizing values
    this.resetWorkspaceDimensions = function() {
        //Delete stored values
        localStorage.removeItem('main_panel_height');
        localStorage.removeItem('output_panel_height');
        localStorage.removeItem('app_panel_width');
        localStorage.removeItem('testing_panel_width');
    }

    //Display a message to the user that they've completed the puzzle
    this.puzzleComplete = function() {
        $("#modal-puzzle-complete").modal('show');
    }

    //Display a notiifcation
    this.displayNotification = function(text) {
        //Create a notification div and append it to the notification area
        var notification = $.parseHTML("<div class='notification'>" + text + "</div>");
        $("#notifications").append(notification);

        //Delete the notification after 6 seconds
        setTimeout(function() {
            $(notification).remove()
        }, 6000);
    }
}
