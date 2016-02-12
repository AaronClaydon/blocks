function UI() {
    //Scale the UI and set window resize events
    this.init = function() {
        //New puzzle header button
        $("#header-new-btn").click(function() {
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle());
        });

        //Save puzzle header button
        $("#header-save-btn").click(function() {
            alert('Not implemented');
        });

        //Load puzzle header button
        $("#header-load-btn").click(function() {
            alert('Not implemented');
        });

        //Application code run button
        $("#application-btn-run").click(function() {
            VisualBlocks.executor.executeApplication();
        });

        //Test code run button
        $("#testing-btn-run").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentTest();
            VisualBlocks.executor.resetTestExecutionData();

            VisualBlocks.executor.executeTest(VisualBlocks.currentPuzzle.currentTest);
        });

        //Test run all button
        $("#testing-btn-run-all").click(function() {
            VisualBlocks.puzzlesManager.updateCurrentTest();
            VisualBlocks.executor.resetTestExecutionData();

            for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
                VisualBlocks.executor.executeTest(i);
            }
        });

        //Clear output button
        $("#output-btn-clear").click(function() {
            VisualBlocks.output.clear();
        });

        //Resize the output panel to users window size
        function outputResize() {
            var newHeight = $("#output-panel").height() - 35;
            $("#output").css('max-height', newHeight);
        }
        $(window).resize(outputResize);
        outputResize();
    };

    //Update the tests panel title
    this.updateTestPanelName = function () {
        //var test = VisualBlocks.currentPuzzle[VisualBlocks.currentPuzzle.currentTest];
        $("#testing-current-name").text(test.name);
    };

    //Update the tests panel selection dropdown
    this.updateTestSelectionDropdown = function () {
        //Generate the tests menu
        menuItemsHTML = "";

        for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
            test = VisualBlocks.currentPuzzle.tests[i];

            menuItemsHTML += '<li><a href="#" data-id="' + i + '">' + test.name + '</a></li>';
        }

        $("#testing-select-menu").html(menuItemsHTML);

        $("#testing-select-menu a").click(function() {
            id = $(this).attr('data-id');

            $("#testing-dropdownMenu").dropdown('toggle')

            //Update the current workspace with any changes to the current test
            VisualBlocks.puzzlesManager.updateCurrentTest();

            VisualBlocks.puzzlesManager.loadTest(id);
            return false;
        });
    };
}
