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
            html = '';
            for (var testID in VisualBlocks.currentPuzzle.tests) {
                test = VisualBlocks.currentPuzzle.tests[testID];

                name = test.name;
                lastRun = VisualBlocks.ui.formatTestResult(VisualBlocks.executor.testExecution.results[testID]);

                html += '<tr><td>' + name + '</td>';
                html += '<td>' + lastRun + '</td>';
                html += '<td><button type="button" class="btn btn-info btn-xs btn-edit" data-id="' + testID + '">Rename</button> ';

                var deleteDisabled = '';
                //Only enable delete button if there are more than one test
                if(Object.keys(VisualBlocks.currentPuzzle.tests).length === 1) {
                    deleteDisabled = 'disabled';
                }
                html += '<button type="button" class="btn btn-danger btn-xs btn-delete" data-id="' + testID + '" ' + deleteDisabled + '>Delete</button>';

                html += '</td></tr>';
            }

            $("#modal-tests-edit-tests-list").html(html);

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
                var encodedPuzzle = JSON.stringify(VisualBlocks.currentPuzzle, null, 4);

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
                console.log(e);
                var contents = e.target.result; //File contents

                try {
                    //Hide the load puzzle modal
                    $("#modal-load").modal('hide');

                    //Parse puzzle json and load it
                    var puzzle = JSON.parse(contents);
                    VisualBlocks.puzzlesManager.loadPuzzle(puzzle);

                    VisualBlocks.output.writeLine('Puzzle ' + puzzle.name + '(' + file.name + ') loaded from file');
                }
                catch(err) {
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

        //Dropdown new test button
        $("#testing-dropdown-new").click(function() {
            $("#modal-tests-new").modal('show');

            //Create a default test name
            $("#input-tests-new-name").val('Test ' + (Object.keys(VisualBlocks.currentPuzzle.tests).length + 1));
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

        //Dropdown edit tests button
        $("#testing-dropdown-edit").click(function() {
            showEditTestsList();
        });

        //Resize the output panel to users window size
        function outputResize() {
            var newHeight = $("#output-panel").height() - 35;
            $("#output").css('max-height', newHeight);
        }
        $(window).resize(outputResize);
        outputResize();
    };

    //Update puzzle name in places where it is displayed
    this.updatePuzzleName = function() {
        var name = VisualBlocks.currentPuzzle.name;

        $("#application-current-name").text(name);
        $("#inputSavePuzzleName").val(name);
    };

    //Update the tests panel title
    this.updateTestPanelName = function () {
        //var test = VisualBlocks.currentPuzzle[VisualBlocks.ui.currentTest];
        $("#testing-current-name").text(test.name);
    };

    //Update the tests panel selection dropdown
    this.updateTestSelectionDropdown = function () {
        menuItemsHTML = "";

        //Go through all tests and create a list item link for it
        for (var testID in VisualBlocks.currentPuzzle.tests) {
            test = VisualBlocks.currentPuzzle.tests[testID];

            menuItemsHTML += '<li><a href="#" data-id="' + testID + '">' + test.name + '</a></li>';
        }

        $("#testing-select-menu").html(menuItemsHTML);

        //Create the event bindings for clicking on a test name in the dropdown
        $("#testing-select-menu a").click(function() {
            id = $(this).attr('data-id');

            $("#testing-dropdownMenu").dropdown('toggle');

            //Update the current workspace with any changes to the current test
            VisualBlocks.puzzlesManager.updateCurrentTest();

            VisualBlocks.puzzlesManager.loadTest(id);
            return false;
        });
    };

    //Formats the test result
    this.formatTestResult = function(testResult) {
        if(testResult === undefined) {
            output = '<span class="bg-danger">NOTHING ASSERTED</span>';
        } else if(testResult) {
            output = '<span class="bg-success">SUCCESS</span>';
        } else {
            output = '<span class="bg-danger">FAILED</span>';
        }

        return output;
    }

    //Format and display the test results in the output panel
    this.outputTestResults = function() {
        //Spacing break line is not needed if output is empty
        VisualBlocks.output.lineBreakIfEmpty();
        VisualBlocks.output.writeLine('<strong>Running all tests</strong>');

        //Generate the results table
        output = '<table class="testing-results-table">';

        for (var testID in VisualBlocks.currentPuzzle.tests) {
            test = VisualBlocks.currentPuzzle.tests[testID];

            //Get the result from the test
            var testResult = VisualBlocks.executor.testExecution.results[testID];

            //Format output for test result
            output += '<tr><td>' + test.name + '</td><td>' + VisualBlocks.ui.formatTestResult(testResult) + '</td></tr>';

            if(testResult) {
                VisualBlocks.executor.testExecution.numPassed += 1; //Add to count of num tests passed
            }
        }

        output += '</table>';
        VisualBlocks.output.write(output);

        //Display success message
        numPassed = VisualBlocks.executor.testExecution.numPassed;
        numTests = Object.keys(VisualBlocks.currentPuzzle.tests).length;
        if(numPassed == 0) {
            VisualBlocks.output.writeLine('<strong>All tests failed</strong>');
        } else if(numPassed == numTests) {
            VisualBlocks.output.writeLine('<strong>All tests passed</strong>');
        } else {
            VisualBlocks.output.writeLine('<strong>' + numPassed + ' out of ' + numTests + ' tests passed</strong>');
        }
    };
}
