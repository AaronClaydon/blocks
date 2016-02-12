/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/executor.js
**
** Handles the compiling and interpreting of applications and tests
** Displays application output and test results in output panel
*/

function Executor() {
    //Provides an API to allow compiled block code to interact with the editor
    function interpreterJSAPI(interpreter, scope) {
        //Add an API function for the alert() block.
        var alertWrapper = function(text) {
            text = text ? text.toString() : '';
            return interpreter.createPrimitive(VisualBlocks.output.writeLine(text));
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

    //API function that allows tests to set their result
    function setTestAssertResult(value, check_if) {
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest] = (value.data == check_if);
    }

    //Executes the users application code
    this.executeApplication = function() {
        //Compile to JavaScript
        var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks._workspaces.appWorkspace);

        //Run through JavaScript Interpreter with our API
        var jsInterpreter = new Interpreter(appCode, interpreterJSAPI);
        jsInterpreter.run();
    }

    //Compile and interpret a given test
    this.executeTest = function(id) {
        VisualBlocks.executor.testExecution.currentTest = id;

        test = VisualBlocks.currentPuzzle.tests[id];

        //Compile the application code
        var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks._workspaces.appWorkspace);

        //Compile the test code
        var testDom = Blockly.Xml.textToDom(test.testCode);
        var runningTestWorkspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(runningTestWorkspace, testDom);
        var testCode = Blockly.JavaScript.workspaceToCode(runningTestWorkspace);

        //Merge application and test code so test can reference it
        var mergedCode = appCode + testCode;

        //Run through JavaScript Interpreter with our API
        var jsInterpreter = new Interpreter(mergedCode, interpreterJSAPI);
        jsInterpreter.run();

        //Get the result from the test
        var testResult = VisualBlocks.executor.testExecution.results[id];

        //Format output for test result
        var output = test.name + ': ' + VisualBlocks.ui.formatTestResult(testResult);

        if(testResult) {
            VisualBlocks.executor.testExecution.numPassed += 1; //Add to count of num tests passed
        }

        VisualBlocks.output.writeLine(output);
    }

    //Execute all tests in the puzzle
    this.executeAllTests = function() {
        //Spacing break line is not needed if output is empty
        VisualBlocks.output.lineBreakIfEmpty();
        VisualBlocks.output.writeLine('<strong>Running all tests</strong>');

        for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
            VisualBlocks.executor.executeTest(i);
        }

        numPassed = VisualBlocks.executor.testExecution.numPassed;
        numTests = VisualBlocks.currentPuzzle.tests.length;
        if(numPassed == 0) {
            VisualBlocks.output.writeLine('<strong>All tests failed</strong>');
        } else if(numPassed == numTests) {
            VisualBlocks.output.writeLine('<strong>All tests passed</strong>');
        } else {
            VisualBlocks.output.writeLine('<strong>' + numPassed + ' out of ' + numTests + ' tests passed</strong>');
        }
    }

    //Set the default test results
    this.resetTestExecutionData = function() {
        VisualBlocks.executor.testExecution = [];
        VisualBlocks.executor.testExecution.currentTest = 0;
        VisualBlocks.executor.testExecution.results = [];
        VisualBlocks.executor.testExecution.numPassed = 0;
    }
}
