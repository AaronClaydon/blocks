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
    window.appWorkspace = createWorkspace('application-panel', 'application-blockly', 'application-toolbox');
    var testsWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'testing-toolbox');

    Blockly.Xml.domToWorkspace(appWorkspace, document.getElementById('startBlocks'));
    Blockly.Xml.domToWorkspace(testsWorkspace, document.getElementById('startBlocks_test1'));

    $("#application-btn-run").click(function() {
        var appCode = Blockly.JavaScript.workspaceToCode(appWorkspace);

        try {
            eval(appCode);
        } catch (e) {
            alert(e);
        }
    });

    $("#testing-btn-run").click(function() {
        var appCode = Blockly.JavaScript.workspaceToCode(appWorkspace);
        var testCode = Blockly.JavaScript.workspaceToCode(testsWorkspace);

        var mergedCode = appCode + testCode;

        console.log(appCode);
        console.log(testCode);

        try {
            eval(mergedCode);
        } catch (e) {
            alert(e);
        }
    });

    $("#output-btn-clear").click(function() {
        $("#output").html('');
    });

    //not to be kept - for testing only
    window.alert = function(text) {
        $("#output").append(text + '<br />');
        var height = $("#output")[0].scrollHeight;
        $("#output").scrollTop(height);
    };

    function outputResize() {
        var newHeight = $("#output-panel").height() - 35;
        $("#output").css('max-height', newHeight);
    }
    window.addEventListener('resize', outputResize, false);
    outputResize();
});
