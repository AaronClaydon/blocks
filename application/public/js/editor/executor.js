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
    //Provides an API to allow compiled application block code to interact with the editor
    function interpreterApplicationJSAPI(interpreter, scope) {
        //Add an API function for the alert() block.
        interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(function(text) {
            text = text ? text.toString() : '';
            return interpreter.createPrimitive(VisualBlocks.output.writeLine(text));
        }));

        //Add an API function for the prompt() block.
        interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(function(text) {
            text = text ? text.toString() : '';
            return interpreter.createPrimitive(prompt(text));
        }));
    }

    //Provides an API to allow compiled test block code to interact with the editor
    function interpreterTestJSAPI(interpreter, scope) {
        //Add an API function for the alert() block.
        interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(function(text) {
            text = text ? text.toString() : '';
            return interpreter.createPrimitive(testFunctionAlert(text));
        }));

        //Add an API function for the prompt() block.
        interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(function(text) {
            text = text ? text.toString() : '';
            return interpreter.createPrimitive(testFunctionPrompt(text));
        }));

        //Add an API function for the assert block
        interpreter.setProperty(scope, 'assert', interpreter.createNativeFunction(function(value, check_if) {
            return interpreter.createPrimitive(setTestAssertResult(value, check_if));
        }));

        //Add an API function for getting the next print output
        interpreter.setProperty(scope, 'getNextOutput', interpreter.createNativeFunction(function() {
            return interpreter.createPrimitive(testGetNextOutput());
        }));

        //TESTING: CONSOLELOG
        interpreter.setProperty(scope, 'consolelog', interpreter.createNativeFunction(function(value) {
            return interpreter.createPrimitive(console.log("FROMTEST: " + value.data));
        }));
    }

    //Function that handles the alert block in tests
    function testFunctionAlert(text) {
        //push alert text into the stack for retrieval
        console.log("PRINT: " + text);
        VisualBlocks.executor.testExecution.alerts.output.push(text);
    }
    //Function that handles the prompt block in tests
    function testFunctionPrompt(text) {
        //TODO: Check if nothing left

        //Get the next value from the stack
        promptSimulatorValueBlock = VisualBlocks.executor.testExecution.promptSimulators[0];

        //Delete this value from the stack
        VisualBlocks.executor.testExecution.promptSimulators.splice(0, 1);

        //Compile the prompt simulator value block to JavaScript
        promptSimulatorValueBlockCode = Blockly.JavaScript.blockToCode(promptSimulatorValueBlock)[0];

        //Execute the prompt simulator value code and set it as the return
        var promptSimulatorValue = eval(promptSimulatorValueBlockCode);
        console.log("PROMPT: " + text + ' | given ' + promptSimulatorValue);
        return promptSimulatorValue;
    }

    //Function that handles getting the next output from the application
    function testGetNextOutput() {
        //TODO: Check if nothing left

        //Get the next value from the stack
        var output = VisualBlocks.executor.testExecution.alerts.output[0];

        //Delete this value from the stack
        VisualBlocks.executor.testExecution.alerts.output.splice(0, 1);

        return output;
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
        var jsInterpreter = new Interpreter(appCode, interpreterApplicationJSAPI);
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

        //Get all the set prompt simulator blocks, in order of definition
        var testBlocks = VisualBlocks._workspaces.testWorkspace.getAllBlocks();
        for (var i = 0; i < testBlocks.length; i++) {
            block = testBlocks[i];

            if(block.type == 'simulate_input') {
                //Get the input block
                inputBlock = block.inputList[0].connection.targetBlock();

                //Push onto the prompt simulator stack
                VisualBlocks.executor.testExecution.promptSimulators.push(inputBlock);
            }
        }

        //Run through JavaScript Interpreter with our API
        var jsInterpreter = new Interpreter(mergedCode, interpreterTestJSAPI);
        jsInterpreter.run();
    }

    //Execute all tests in the puzzle
    this.executeAllTests = function() {
        for (var testID in VisualBlocks.currentPuzzle.tests) {
            VisualBlocks.executor.executeTest(testID);
        }
    }

    //Set the default test results
    this.resetTestExecutionData = function() {
        VisualBlocks.executor.testExecution = [];
        VisualBlocks.executor.testExecution.currentTest = 'default';
        VisualBlocks.executor.testExecution.results = {};

        //Stack of all prompt simulator blocks
        VisualBlocks.executor.testExecution.promptSimulators = [];

        //Stack of alert data
        VisualBlocks.executor.testExecution.alerts = {};
        VisualBlocks.executor.testExecution.alerts.output = [];

        VisualBlocks.executor.testExecution.numPassed = 0;
    }
}
