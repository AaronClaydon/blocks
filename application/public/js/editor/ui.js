/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/ui.js
**
** Manages dynamic UI elements
*/

function UI() {
    //Scale the UI and set window resize events
    this.init = function() {
        //New puzzle modal button
        $("#modal-new-btn").click(function() {
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle());
        });

        //Save puzzle locally modal button
        $("#modal-save-locally-btn").click(function() {
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
        });

        //Test run all button
        $("#testing-btn-run-all").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentTest();
            VisualBlocks.executor.resetTestExecutionData();

            VisualBlocks.executor.executeAllTests();
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
            $("#input-tests-new-name").val('Test ' + (VisualBlocks.currentPuzzle.tests.length + 1));
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
                VisualBlocks.puzzlesManager.loadTest(testNumber - 1);
            }
        });
        //Create new test modal cancel button
        $("#modal-tests-new-cancel-btn").click(function() {
            $("#input-tests-new-name").val('');
        });

        //Dropdown edit tests button
        $("#testing-dropdown-edit").click(function() {
            $("#modal-tests-edit").modal('show');

            //Generate the list of tests
            function generateTestsList() {
                html = '';
                for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
                    test = VisualBlocks.currentPuzzle.tests[i];

                    name = test.name;
                    lastRun = VisualBlocks.ui.formatTestResult(VisualBlocks.executor.testExecution.results[i]);

                    html += '<tr><td>' + name + '</td>';
                    html += '<td>' + lastRun + '</td>';
                    html += '<td> <button type="button" class="btn btn-danger btn-xs" data-id="' + i + '">Delete</button></td></tr>';
                }

                $("#modal-tests-edit-list").html(html);

                //Create the event bindings for pressing the delete button
                $("#modal-tests-edit-list button").click(function() {
                    id = $(this).attr('data-id');

                    VisualBlocks.puzzlesManager.deleteTest(id);

                    VisualBlocks.ui.updateTestSelectionDropdown();
                    generateTestsList();

                    //If we just deleted are currently opened test we open another one
                    if(id == VisualBlocks.ui.currentTest) {
                        VisualBlocks.puzzlesManager.loadTest(0);
                    }
                });
            }
            generateTestsList();
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
        for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
            test = VisualBlocks.currentPuzzle.tests[i];

            menuItemsHTML += '<li><a href="#" data-id="' + i + '">' + test.name + '</a></li>';
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
}
