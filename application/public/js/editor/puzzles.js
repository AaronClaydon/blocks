/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/assert.js
**
** Manages the currently loaded puzzle
*/

function PuzzlesManager() {
    //Load a puzzle object as the current puzzle
    this.loadPuzzle = function(puzzle) {
        //Set it as current
        VisualBlocks.currentPuzzle = puzzle;

        //Load the application code
        VisualBlocks._workspaces.loadApplication(puzzle.applicationCode);

        //Update puzzle name in UI
        VisualBlocks.ui.updatePuzzleName();
        //Generate the tests menu
        VisualBlocks.ui.updateTestSelectionDropdown();

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

        return uid;
    }

    //Deletes a given test
    this.deleteTest = function(id) {
        delete VisualBlocks.currentPuzzle.tests[id];
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
    this.tests = content.tests || {'defaul1': {
        'name': 'Test 1',
        'testCode': '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>'
    }};
}
