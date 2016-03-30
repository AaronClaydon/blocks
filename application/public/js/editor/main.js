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
    //VisualBlocks.puzzlesManager.newPuzzle(); //Load a default blank puzzle
    VisualBlocks.puzzlesManager.loadPuzzleFromFile('/puzzles/power_2.vbpuz'); //Load puzzle from file
});
