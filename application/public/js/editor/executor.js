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
        var runningTestWorkspace = Blockly.inject('running-test-workspace', {});
        Blockly.Xml.domToWorkspace(runningTestWorkspace, testDom);
        var testCode = Blockly.JavaScript.workspaceToCode(runningTestWorkspace);

        var mergedCode = appCode + testCode;

        //console.log(appCode);
        //console.log(testCode);

        var jsInterpreter = new Interpreter(mergedCode, interpreterJSAPI);
        jsInterpreter.run();

        var testResult = VisualBlocks.executor.testExecution.results[id];
        var output = '<strong>' + test.name + '</strong>: ';

        if(testResult === undefined) {
            output += '<span class="bg-danger">NOTHING ASSERTED</span>';
        } else if(testResult) {
            output += '<span class="bg-success">SUCCESS</span>';
        } else {
            output += '<span class="bg-danger">FAILED</span>';
        }

        VisualBlocks.output.writeLine(output);
    }

    this.resetTestExecutionData = function() {
        VisualBlocks.executor.testExecution = [];
        VisualBlocks.executor.testExecution.currentTest = 0;
        VisualBlocks.executor.testExecution.results = [];
    }
}
