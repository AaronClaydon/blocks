$(document).ready(function() {
    window.VisualBlocks = [];

    VisualBlocks._workspaces = new WorkSpaces();
    VisualBlocks.executor = new Executor();
    VisualBlocks.output = new Output($("#output"));

    VisualBlocks.ui = new UI();
    VisualBlocks.ui.init();

    VisualBlocks.puzzlesManager = new PuzzlesManager();
    //Load a default blank puzzle
    //VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle());
    //Load puzzle from file
    VisualBlocks.puzzlesManager.loadPuzzleFromFile('/puzzles/test1.json');
});
