$(document).ready(function() {
    window.VisualBlocks = [];

    VisualBlocks._workspaces = new WorkSpaces();
    VisualBlocks._workspaces.init();

    VisualBlocks.executor = new Executor();
    VisualBlocks.output = new Output($("#output"));

    VisualBlocks.ui = new UI();
    VisualBlocks.ui.init();

    VisualBlocks.puzzlesManager = new PuzzlesManager();
    //VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle()); //Load a default blank puzzle
    VisualBlocks.puzzlesManager.loadPuzzleFromFile('/puzzles/test1.json'); //Load puzzle from file
});
