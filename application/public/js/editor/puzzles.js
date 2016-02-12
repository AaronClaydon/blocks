function PuzzlesManager() {
    function loadPuzzle(puzzle) {
        VisualBlocks.currentPuzzle = puzzle;

        //Load the application code
        VisualBlocks._workspaces.loadApplication(puzzle.applicationCode);

        //Generate the tests menu
        VisualBlocks.ui.updateTestSelectionDropdown();

        //Load the first test
        VisualBlocks.puzzlesManager.loadTest(0);
    }

    function loadPuzzleFromFile(filename) {
        $.getJSON(filename, function(data) {
            loadPuzzle(new Puzzle(data));
        });
    }

    this.loadTest = function(id) {
        test = VisualBlocks.currentPuzzle.tests[id];

        //Set current test id
        VisualBlocks.currentPuzzle.currentTest = id;

        //Update test panel UI
        VisualBlocks.ui.updateTestPanelName();

        //Load the code to the Blockly workspace
        VisualBlocks._workspaces.loadTest(test.testCode);
    };

    this.updateCurrentTest = function() {
        //Update the current puzzle with any changes to the current test
        VisualBlocks.currentPuzzle.tests[VisualBlocks.currentPuzzle.currentTest].testCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(VisualBlocks._workspaces.testWorkspace));
    }

    //Load a default blank puzzle
    //loadPuzzle(new Puzzle());

    //Load puzzle from file
    loadPuzzleFromFile('/puzzles/test1.json');
}

function Puzzle(content) {
    this.name = content.name || 'default';
    //this.puzzle = false;
    this.applicationCode = content.applicationCode || '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
    this.tests = content.tests || [{
        'name': 'Test 1',
        'testCode': '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
    }];
}
