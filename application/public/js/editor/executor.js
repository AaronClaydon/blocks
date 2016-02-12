function Executor() {
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

    function setTestAssertResult(value, check_if) {
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest] = (value.data == check_if);
    }

    this.executeApplication = function() {
        var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks._workspaces.appWorkspace);

        var jsInterpreter = new Interpreter(appCode, interpreterJSAPI);
        jsInterpreter.run();
    }

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

        var mergedCode = appCode + testCode;

        var jsInterpreter = new Interpreter(mergedCode, interpreterJSAPI);
        jsInterpreter.run();

        var testResult = VisualBlocks.executor.testExecution.results[id];
        var output = test.name + ': ';

        if(testResult === undefined) {
            output += '<span class="bg-danger">NOTHING ASSERTED</span>';
        } else if(testResult) {
            VisualBlocks.executor.testExecution.numPassed += 1; //Add to count of num tests passed
            output += '<span class="bg-success">SUCCESS</span>';
        } else {
            output += '<span class="bg-danger">FAILED</span>';
        }

        VisualBlocks.output.writeLine(output);
    }

    this.executeAllTests = function() {
        //Spacing break line is not needed if output is empty
        VisualBlocks.output.lineBreakIfEmpty();
        VisualBlocks.output.writeLine('<strong>Running all tests</strong>');

        for (var i = 0; i < VisualBlocks.currentPuzzle.tests.length; i++) {
            VisualBlocks.executor.executeTest(i);
        }

        numPassed = VisualBlocks.executor.testExecution.numPassed;
        numTests = VisualBlocks.executor.testExecution.results.length;
        if(numPassed == 0) {
            VisualBlocks.output.writeLine('<strong>All tests failed</strong>');
        } else if(numPassed == numTests) {
            VisualBlocks.output.writeLine('<strong>All tests passed</strong>');
        } else {
            VisualBlocks.output.writeLine('<strong>' + numPassed + ' out of ' + numTests + ' tests passed</strong>');
        }
    }

    this.resetTestExecutionData = function() {
        VisualBlocks.executor.testExecution = [];
        VisualBlocks.executor.testExecution.currentTest = 0;
        VisualBlocks.executor.testExecution.results = [];
        VisualBlocks.executor.testExecution.numPassed = 0;
    }
}
