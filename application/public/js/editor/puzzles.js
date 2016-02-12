function PuzzlesManager() {
    this.loadPuzzle = function(puzzle) {
        VisualBlocks.currentPuzzle = puzzle;

        //Load the application code
        VisualBlocks._workspaces.loadApplication(puzzle.applicationCode);

        //Update puzzle name in UI
        VisualBlocks.ui.updatePuzzleName();
        //Generate the tests menu
        VisualBlocks.ui.updateTestSelectionDropdown();

        //Load the first test
        VisualBlocks.puzzlesManager.loadTest(0);
    }

    this.loadPuzzleFromFile = function(filename) {
        $.getJSON(filename, function(data) {
            VisualBlocks.output.writeLine('Loaded remote puzzle ' + data.name + ' from ' + filename);
            VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle(data));
        });
    }

    this.loadTest = function(id) {
        test = VisualBlocks.currentPuzzle.tests[id];

        //Set current test id
        VisualBlocks.ui.currentTest = id;

        //Update test panel UI
        VisualBlocks.ui.updateTestPanelName();

        //Load the code to the Blockly workspace
        VisualBlocks._workspaces.loadTest(test.testCode);
    };

    this.updateCurrentTest = function() {
        //Update the current puzzle with any changes to the current test
        VisualBlocks.currentPuzzle.tests[VisualBlocks.ui.currentTest].testCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(VisualBlocks._workspaces.testWorkspace));
    }
}

//Hold puzzle data
function Puzzle(content) {
    //allow default values if not loading from file
    if(content === undefined) {
        content = {};
    }
    this.name = content.name || 'New Puzzle';
    //this.puzzle = false;
    this.applicationCode = content.applicationCode || '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
    this.tests = content.tests || [{
        'name': 'Test 1',
        'testCode': '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
    }];
}
