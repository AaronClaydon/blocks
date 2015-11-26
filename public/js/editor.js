function createWorkspace(area, workspace, toolbox) {
    var blocklyArea = document.getElementById(area);
    var blocklyDiv = document.getElementById(workspace);
    var workspace = Blockly.inject(blocklyDiv, {toolbox: document.getElementById(toolbox)});
    var onresize = function(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = blocklyArea;
        var x = 0;
        var y = 36;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);

        // Position blocklyDiv over blocklyArea.
        blocklyDiv.style.left = x + 'px';
        blocklyDiv.style.top = y + 'px';
        blocklyDiv.style.width = (blocklyArea.offsetWidth - 10) + 'px';
        blocklyDiv.style.height = (blocklyArea.offsetHeight - 36) + 'px';
    };
    window.addEventListener('resize', onresize, false);
    onresize();

    return workspace;
}

$(document).ready(function() {
    var appWorkspace = createWorkspace('application-panel', 'application-blockly', 'application-toolbox');
    var testsWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'testing-toolbox');

    Blockly.Xml.domToWorkspace(appWorkspace, document.getElementById('startBlocks'));

    $("#application-btn-run").click(function() {
        var code = Blockly.JavaScript.workspaceToCode(appWorkspace);

        try {
            eval(code);
        } catch (e) {
            alert(e);
        }
    });
});
