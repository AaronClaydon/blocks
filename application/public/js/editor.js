window.VisualBlocks = [];

//Test stuff
VisualBlocks.currentWorkspace = [];
VisualBlocks.currentWorkspace.name = '';
VisualBlocks.currentWorkspace.puzzle = false;
VisualBlocks.currentWorkspace.applicationCode = '';
VisualBlocks.currentWorkspace.tests = [];

VisualBlocks.currentTest = 0;

VisualBlocks.testExecution = [];
VisualBlocks.testExecution.currentTest = 0;
VisualBlocks.testExecution.results = [];

//end of test stuff

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

function writeToOutput(text) {
    $("#output").append(text + '<br />');
    var height = $("#output")[0].scrollHeight;
    $("#output").scrollTop(height);
}

function loadWorkspace(filename) {
    $.getJSON(filename, function(workspace) {
        VisualBlocks.currentWorkspace = workspace;

        //Load the application code
        Blockly.Xml.domToWorkspace(VisualBlocks.appWorkspace, Blockly.Xml.textToDom(VisualBlocks.currentWorkspace.applicationCode));

        //Generate the tests menu
        menuItemsHTML = "";

        for (var i = 0; i < VisualBlocks.currentWorkspace.tests.length; i++) {
            test = VisualBlocks.currentWorkspace.tests[i];

            menuItemsHTML += '<li><a href="#" data-id="' + i + '">' + test.name + '</a></li>';
        }

        $("#testing-select-menu").html(menuItemsHTML);

        $("#testing-select-menu a").click(function() {
            id = $(this).attr('data-id');

            $("#testing-dropdownMenu").dropdown('toggle')

            //Update the current workspace with any changes to the current test
            updateWorkspaceTest();

            loadTest(id);
            return false;
        });

        //Load the first test
        loadTest(0);
    });
}

function updateWorkspaceTest() {
    //Update the current workspace with any changes to the current test
    VisualBlocks.currentWorkspace.tests[VisualBlocks.currentTest].testCode = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(VisualBlocks.testsWorkspace));
}

function loadTest(id) {
    test = VisualBlocks.currentWorkspace.tests[id];

    //Set current test id
    VisualBlocks.currentTest = id;

    //Change test panel title
    $("#testing-current-name").text(test.name);

    VisualBlocks.testsWorkspace.clear(); //Clear the current tests workspace

    //Load the code to the Blockly workspace
    testDom = Blockly.Xml.textToDom(test.testCode);
    Blockly.Xml.domToWorkspace(VisualBlocks.testsWorkspace, testDom);
}

function runTest(id) {
    VisualBlocks.testExecution.currentTest = id;

    test = VisualBlocks.currentWorkspace.tests[id];

    //Compile the application code
    var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks.appWorkspace);

    //Compile the test code
    var testDom = Blockly.Xml.textToDom(test.testCode);
    var runningTestWorkspace = Blockly.inject('running-test-workspace', {});
    Blockly.Xml.domToWorkspace(runningTestWorkspace, testDom);
    var testCode = Blockly.JavaScript.workspaceToCode(runningTestWorkspace);

    var mergedCode = appCode + testCode;

    //console.log(appCode);
    //console.log(testCode);

    var jsInterpreter = new Interpreter(mergedCode, interpreterJSAPI);
    jsInterpreter.run();

    var testResult = VisualBlocks.testExecution.results[id];
    var output = '<strong>' + test.name + '</strong>: ';

    if(testResult === undefined) {
        output += '<span class="bg-danger">NOTHING ASSERTED</span>';
    } else if(testResult) {
        output += '<span class="bg-success">SUCCESS</span>';
    } else {
        output += '<span class="bg-danger">FAILED</span>';
    }

    writeToOutput(output);
}

function resetTestExecutionData() {
    VisualBlocks.testExecution = [];
    VisualBlocks.testExecution.currentTest = 0;
    VisualBlocks.testExecution.results = [];
}

function interpreterJSAPI(interpreter, scope) {
    //Add an API function for the alert() block.
    var alertWrapper = function(text) {
        text = text ? text.toString() : '';
        return interpreter.createPrimitive(writeToOutput(text));
    };
    interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(alertWrapper));

    //Add an API function for the prompt() block.
    var promptWrapper = function(text) {
        text = text ? text.toString() : '';
        return interpreter.createPrimitive(prompt(text));
    };
    interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(promptWrapper));

    //Add an API function for the assert block
    var assertWrapper = function(value, check_if) {
        return interpreter.createPrimitive(setTestAssertResult(value, check_if));
    };
    interpreter.setProperty(scope, 'assert', interpreter.createNativeFunction(assertWrapper));
}

function setTestAssertResult(value, check_if) {
    VisualBlocks.testExecution.results[VisualBlocks.testExecution.currentTest] = (value.data == check_if);
}

$(document).ready(function() {
    VisualBlocks.appWorkspace = createWorkspace('application-panel', 'application-blockly', 'application-toolbox');
    VisualBlocks.testsWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'testing-toolbox');

    loadWorkspace('/puzzles/test1.json')

    $("#application-btn-run").click(function() {
        var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks.appWorkspace);

        var jsInterpreter = new Interpreter(appCode, interpreterJSAPI);
        jsInterpreter.run();
    });

    $("#testing-btn-run").click(function() {
        updateWorkspaceTest();
        resetTestExecutionData();

        runTest(VisualBlocks.currentTest);
    });

    $("#testing-btn-run-all").click(function() {
        updateWorkspaceTest();
        resetTestExecutionData();

        for (var i = 0; i < VisualBlocks.currentWorkspace.tests.length; i++) {
            runTest(i);
        }
    });

    $("#output-btn-clear").click(function() {
        $("#output").html('');
    });

    //not to be kept - for testing only
    window.alert = function(text) {
        writeToOutput(text);
    };

    function outputResize() {
        var newHeight = $("#output-panel").height() - 35;
        $("#output").css('max-height', newHeight);
    }
    window.addEventListener('resize', outputResize, false);
    outputResize();
});
