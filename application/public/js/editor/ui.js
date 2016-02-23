/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/ui.js
**
** Manages dynamic UI elements
*/

function UI() {
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

    //Scale the UI and set window resize events
    this.init = function() {
        //Custom handlebars function for if comparison
        Handlebars.registerHelper('if_eq', function(a, b, opts) {
            if(a == b) // Or === depending on your needs
            return opts.fn(this);
            else
            return opts.inverse(this);
        });

        //New puzzle modal button
        $("#modal-new-btn").click(function() {
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle());
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
                    throw err;
                    console.log(err);
                    alert('Cannot load puzzle');
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
        //If display steps button
        if(Object.keys(VisualBlocks.currentPuzzle.steps).length > 0) {
            $("#nav-header-steps-btn").css('display', 'block');
        } else {
            $("#nav-header-steps-btn").css('display', 'none');
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
