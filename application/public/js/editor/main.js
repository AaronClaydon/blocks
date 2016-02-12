$(document).ready(function() {
    window.VisualBlocks = [];

    VisualBlocks._workspaces = new WorkSpaces();
    VisualBlocks.executor = new Executor();
    VisualBlocks.output = new Output($("#output"));

    VisualBlocks.ui = new UI();
    VisualBlocks.ui.init();

    VisualBlocks.puzzlesManager = new PuzzlesManager();
});
