/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/main.js
**
** Entry point for the editor application
** Creates other interfaces and initilizes them
*/

$(document).ready(function() {
    window.VisualBlocks = [];

    //Blockly workspaces
    VisualBlocks._workspaces = new WorkSpaces();
    VisualBlocks._workspaces.loadReservedWords();

    //Block compiler and interpreter
    VisualBlocks.executor = new Executor();
    VisualBlocks.executor.resetTestExecutionData();

    //Output panel
    VisualBlocks.output = new Output($("#output"));

    //Manages dynamic UI elements
    VisualBlocks.ui = new UI();
    VisualBlocks.ui.init();

    //Manages the current loaded puzzle
    VisualBlocks.puzzlesManager = new PuzzlesManager();

    var urlSplit = window.location.pathname.split('/');
    if(urlSplit.length == 3 && urlSplit[2] !== "") {
        //Load the requested published puzzle
        VisualBlocks.puzzlesManager.loadPuzzleFromFile('/puzzles/user/' + urlSplit[2] + '.vbpuz');
    } else {
        VisualBlocks.puzzlesManager.newWorkspace(); //Load a default blank puzzle
        //VisualBlocks.puzzlesManager.loadPuzzleFromFile('/puzzles/set/introTests2.vbpuz'); //DEBUG: Load puzzle from file
    }
});
