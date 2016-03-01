/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/ui.js
**
** Manages dynamic UI elements
*/

function UI() {
    //Details about the step events
    var block_variables = ["type", "function_name", "value"];
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
                    variables: ["numTests"]
                }
            }
        },
        "tests_result": {
            name: "Test Results",
            specific_workspace: false,
            equalities: {
                "equality": {
                    name: "Test Results",
                    variables: ["numTests", "numPassed"]
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

    function editPuzzleStepUI(step, id) {
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
            eventType = $(this).val();
            html = "";

            //Only render the success condition html if the type is not none
            if(eventType !== "none") {
                html = VisualBlocks.ui.renderTemplate("edit-puzzle-steps-edit-success-condition", {
                    event_definition: event_definitions[eventType],
                    step: step,
                    id: id
                })
            }

            //Render the success form in the modal
            $("#modal-edit-steps-edit-body-success-condition").html(html);
        });

        //Show the event data form
        $("#edit-puzzle-step-success-event").change();
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

                //Return the variable name, current value, and the equality
                ret += options.fn({
                    name: variable,
                    value: setVariables[variable],
                    equality: key
                });
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
            alert('Currently not implemented');
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
                testCodeEditable: $("#edit-puzzle-opt-testcodeeditable").is(':checked'),
                testListEditable: $("#edit-puzzle-opt-testlisteditable").is(':checked')
            };

            VisualBlocks.ui.updatePuzzleName();
            $("#modal-edit-puzzle").modal('hide');
        });

        //Edit puzzle steps header button
        $("#nav-header-edit-puzzle-steps-btn").click(function() {
            $("#modal-edit-steps-data").html(VisualBlocks.ui.renderTemplate("edit-puzzle-steps-list", VisualBlocks.currentPuzzle));
            $("#modal-edit-steps-list").modal('show');

            //Edit step button
            $("#modal-edit-steps-list .btn-edit").click(function() {
                id = $(this).attr('data-id');

                editPuzzleStepUI(VisualBlocks.currentPuzzle.steps[id], id);
            });

            //Delete step button
            $("#modal-edit-steps-list .btn-delete").click(function() {
                id = $(this).attr('data-id');

                //delete the step
                VisualBlocks.puzzlesManager.deleteStep(id);
                //real hacky way of redrawing the list
                $("#nav-header-edit-puzzle-steps-btn").click();
            });
        });

        //Edit puzzle steps add new step button
        $("#modal-edit-steps-add-btn").click(function() {
            id = Blockly.genUid(); //generate a unique id for this step
            editPuzzleStepUI({}, id);
        });

        //Edit puzzle step save button
        $("#modal-edit-steps-edit-save-btn").click(function() {
            successCondition = {};
            successEvent = $("#edit-puzzle-step-success-event").val();

            //Construct the step data
            step = {
                title: $("#edit-puzzle-step-title").val(),
                description: $("#edit-puzzle-step-description").val()
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
                        variableValue = $("#event-step-equality-value-" + equalityID + "-" + variable).val();

                        //If the variable value is blank we dont add it to the definition
                        if(variableValue !== "") {
                            equalityValues[variable] = variableValue;
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

            console.log(step);

            //Save the step data to the current puzzle
            stepID = $("#edit-puzzle-step-id").val();
            VisualBlocks.puzzlesManager.editStep(stepID, step);

            //Show the edit puzzle list modal
            $("#modal-edit-steps-edit").modal('hide');
            $("#nav-header-edit-puzzle-steps-btn").click();

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

        //Save puzzle remotely (publish) modal button
        $("#modal-save-publish-btn").click(function() {
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

        //Resize the output panel to users window size
        function outputResize() {
            var newHeight = $("#output-panel").height() - 35;
            $("#output").css('max-height', newHeight);
        }
        $(window).resize(outputResize);
        outputResize();

        //Load the users dimension settings
        $("#application-panel").width(localStorage.getItem('app_panel_width') + "%");
        $("#testing-panel").width(localStorage.getItem('testing_panel_width') + "%");
        $(".main-panels").height(localStorage.getItem('main_panel_height') + "%");
        $(".output-panel").height(localStorage.getItem('output_panel_height') + "%");

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

                window.dispatchEvent(new Event('resize'));
            });
    };

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
        $("#testing-select-menu").html(this.renderTemplate("testing-select-menu", VisualBlocks.currentPuzzle));

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

        //Call test results event, with test results - shouldn't really be in ui
        VisualBlocks.puzzlesManager.callEvent("tests_result", {
            numTests: numTests,
            numPassed: numPassed
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

        //Display edit puzzle & steps button if this is a unpublished puzzle
        if(VisualBlocks.currentPuzzle.isPuzzle && !VisualBlocks.currentPuzzle.isPublished) {
            $(".nav-header-edit-puzzle").css('display', 'block');
        } else {
            $(".nav-header-edit-puzzle").css('display', 'none');
        }

        //Calculate the progress
        steps = VisualBlocks.currentPuzzle.steps;
        stepsTotal = 0;
        stepsCompleted = 0;

        //Count how many steps completed
        for (var stepID in steps) {
            if(steps[stepID].successCondition !== undefined) {
                steps[stepID].hasSuccessCondition = true;
                stepsTotal++;
            }
            if(steps[stepID].completed) {
                stepsCompleted++;
            }
        }

        stepsPercent = (stepsCompleted / stepsTotal) * 100;

        //Render the steps list in the modal
        $("#modal-steps-list").html(VisualBlocks.ui.renderTemplate("steps-list", {
            steps: steps,
            progress: {
                display: (stepsTotal > 0),
                completed: stepsCompleted,
                total: stepsTotal,
                percent: stepsPercent
            }
        }));
    };
}
