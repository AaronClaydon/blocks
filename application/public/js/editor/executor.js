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

        //Add an API function that ignores updatedVariable()
        interpreter.setProperty(scope, 'updatedVariable', interpreter.createNativeFunction(function(name) {}));
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
            interpreter.createPrimitive(setTestAssertResult(value, check_if));
        }));

        //Add an API function for getting the next print output
        interpreter.setProperty(scope, 'getNextOutput', interpreter.createNativeFunction(function() {
            return interpreter.createPrimitive(testGetNextOutput());
        }));

        //Add an API function for checking if any outputs left
        interpreter.setProperty(scope, 'getIfOutputsLeft', interpreter.createNativeFunction(function() {
            return interpreter.createPrimitive(testGetIfOutputsLeft());
        }));

        //Add an API function for checking if any prompts left
        interpreter.setProperty(scope, 'getIfPromptsMissed', interpreter.createNativeFunction(function() {
            return interpreter.createPrimitive(testGetIfPromptsMissed());
        }));

        //Add an API function for ignoring and deleting the next output
        interpreter.setProperty(scope, 'ignoreNextOutput', interpreter.createNativeFunction(function() {
            interpreter.createPrimitive(testIgnoreNextOutput());
        }));

        //Add an API function for notifying variable update
        interpreter.setProperty(scope, 'updatedVariable', interpreter.createNativeFunction(function(name) {
            interpreter.createPrimitive(testUpdatedVariable(name));
        }));

        //TESTING: CONSOLELOG
        interpreter.setProperty(scope, 'consolelog', interpreter.createNativeFunction(function(value) {
            return interpreter.createPrimitive(console.log("FROMTEST: " + value.data));
        }));
    }

    //Function that handles the alert block in tests
    function testFunctionAlert(text) {
        //push alert text into the stack for retrieval
        VisualBlocks.executor.testExecution.alerts.output.push(text);
        //push alert text into the list of all outputs in this exeuction run
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].alerts.push(text);

        //Log the execution
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].executionLog.push({
            type: 'print',
            value: text
        });
    }
    //Function that handles the prompt block in tests
    function testFunctionPrompt(text) {
        var promptSimulatorValue;

        //Get the next value from the stack
        inputID = VisualBlocks.executor.testExecution.promptSimulator.next;

        //Check if we got an input for this prompt
        if(VisualBlocks.executor.testExecution.promptSimulator.block != null
            && inputID < VisualBlocks.executor.testExecution.promptSimulator.block.inputList.length) {

            promptSimulatorValueBlock = VisualBlocks.executor.testExecution.promptSimulator.block.inputList[inputID].connection.targetBlock();

            //Increment next input value
            VisualBlocks.executor.testExecution.promptSimulator.next += 1;

            //Compile the prompt simulator value block to JavaScript
            promptSimulatorValueBlockCode = Blockly.JavaScript.blockToCode(promptSimulatorValueBlock)[0];

            //Execute the prompt simulator value code and set it as the return
            promptSimulatorValue = eval(promptSimulatorValueBlockCode);
        } else {
            promptSimulatorValue = undefined;
        }

        if (promptSimulatorValue === undefined) {
            VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].unhandledPrompt = true;
        }

        //Log the execution
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].executionLog.push({
            type: 'prompt',
            text: text,
            value: promptSimulatorValue
        });

        return promptSimulatorValue;
    }

    //Function that handles getting the next output from the application
    function testGetNextOutput() {
        //Get the next value from the stack
        var output = VisualBlocks.executor.testExecution.alerts.output[0];

        //Delete this value from the stack
        VisualBlocks.executor.testExecution.alerts.output.splice(0, 1);

        return output;
    }

    //Function that handles checks if there are any outputs left
    function testGetIfOutputsLeft() {
        return (VisualBlocks.executor.testExecution.alerts.output.length > 0);
    }

    //Function that handles checks if any prompts were missed and not handled
    function testGetIfPromptsMissed() {
        console.log('NI: testGetIfPromptsMissed');
    }

    //Function that handles ignoring and deleting the next output
    function testIgnoreNextOutput() {
        //Delete this value from the stack
        VisualBlocks.executor.testExecution.alerts.output.splice(0, 1);
    }

    //API function that allows tests to set their result
    function setTestAssertResult(value, check_if) {
        //Get current test result and calculate new test result
        currentResult = VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].success;
        newResult = (value.data == check_if);

        //Log the fact the test has had an assertion
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].assertion = true;

        //Only update test result if none already set or if changing from success to failure
        if(currentResult === undefined || (currentResult && !newResult)) {
            VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].success = newResult;
        }

        //Log the execution
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].executionLog.push({
            type: 'assert',
            value: value.data,
            check_if: check_if.data
        });
    }

    //Function that handles notifying variable updates
    function testUpdatedVariable(name) {
        value = VisualBlocks.executor.testExecution.jsInterpreter.variableValues[name.data];

        //Log the variable update
        VisualBlocks.executor.testExecution.results[VisualBlocks.executor.testExecution.currentTest].executionLog.push({
            type: 'variable_set',
            name: name.data,
            value: value
        });
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

        //add default test result data
        VisualBlocks.executor.testExecution.results[id] = {
            assertion: false,
            success: undefined,
            unhandledPrompt: false,
            executionLog: [],
            variables: [],
            alerts: []
        };

        //Compile the application code
        var appCode = Blockly.JavaScript.workspaceToCode(VisualBlocks._workspaces.appWorkspace);

        //Compile the test code
        var testDom = Blockly.Xml.textToDom(test.testCode);
        var runningTestWorkspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(runningTestWorkspace, testDom);
        var testCode = Blockly.JavaScript.workspaceToCode(runningTestWorkspace);

        //Merge application and test code so test can reference it
        var mergedCode = appCode + testCode;

        //Reset the prompt simulator and output data
        VisualBlocks.executor.testExecution.promptSimulator.next = 0;
        VisualBlocks.executor.testExecution.promptSimulator.block = null;
        VisualBlocks.executor.testExecution.alerts.output = [];

        //Find the first prompt simulator block in the test
        var testBlocks = runningTestWorkspace.getAllBlocks();
        for (var i = 0; i < testBlocks.length; i++) {
            block = testBlocks[i];

            if(block.type == 'simulate_input') {
                VisualBlocks.executor.testExecution.promptSimulator.block = block;
                break;
            }
        }

        VisualBlocks.executor.testExecution.runningTestWorkspace = runningTestWorkspace;

        //Run through JavaScript Interpreter with our API
        var jsInterpreter = new Interpreter(mergedCode, interpreterTestJSAPI);
        VisualBlocks.executor.testExecution.jsInterpreter = jsInterpreter;
        jsInterpreter.run();

        //Set list of test execution final variable values
        VisualBlocks.executor.testExecution.results[id].variables = jsInterpreter.variableValues;

        //Check if the test had an unhandled prompt and force it to failure
        if(VisualBlocks.executor.testExecution.results[id].unhandledPrompt) {
            ignoreUnhandled = false;

            //check if there is an ignore unhandled block
            for (var i = 0; i < testBlocks.length; i++) {
                block = testBlocks[i];

                if(block.type == 'ignore_unhandled_prompt') {
                    ignoreUnhandled = true;

                    //Delete the unhandled error message so we get the proper reason if failure
                    VisualBlocks.executor.testExecution.results[id].unhandledPrompt = false;

                    break;
                }
            }

            //if we dont ignore unhandled then set this test as a failure
            if(!ignoreUnhandled) {
                VisualBlocks.executor.testExecution.results[id].success = false;
            }
        }
    }

    //Execute all tests in the puzzle
    this.executeAllTests = function() {
        //Get the relevant steps to compare against
        relevantSteps = [];
        relevantStepsBeenSet = {};
        relevantStepsResults = {};
        for (var i in VisualBlocks.currentPuzzle.steps) {
            step = VisualBlocks.currentPuzzle.steps[i];
            step.id = i;
            successCondition = step.successCondition;

            if(successCondition !== undefined) {
                //Add to the list of relevant events for blocks
                if($.inArray(successCondition.event, ['print_output', 'final_variable_value']) > -1) {
                    relevantSteps.push(step);
                }
            }
        }

        //Iterate through all the puzzle tests and execute them
        for (var testID in VisualBlocks.currentPuzzle.tests) {
            //Actually execute the test
            VisualBlocks.executor.executeTest(testID);
            testResult = VisualBlocks.executor.testExecution.results[testID];

            //Go through all the relevant steps
            for (var stepID in relevantSteps) {
                step = relevantSteps[stepID];
                successCondition = step.successCondition;

                //If it has already been set as true then we ignore the result of the results
                if(!relevantStepsBeenSet[stepID]) {
                    //Print output matching event
                    if(successCondition.event === 'print_output') {
                        //Check if the given output string was ever outputed
                        stepResult = ($.inArray(successCondition.equality.string, testResult.alerts) > -1);
                    //Final variable value matching event
                    } else if(successCondition.event === 'final_variable_value') {
                        stepResult = false;
                        variable = testResult.variables[successCondition.equality.name];

                        //Variable was never defined in the execution
                        if(variable !== undefined) {
                            //Check if the variable type and value are a match
                            stepResult = (variable.type === successCondition.equality.type && variable.data == successCondition.equality.value);
                        }
                    }

                    //Record the value, if its become true then we dont care about this step anymore
                    relevantStepsResults[stepID] = stepResult;
                    if(stepResult) {
                        relevantStepsBeenSet[stepID] = true;
                    }
                }
            }
        }

        //Update all the steps
        for (var stepID = 0; stepID < relevantSteps.length; stepID++) {
            step = relevantSteps[stepID];
            VisualBlocks.puzzlesManager.updateStep(step.id, relevantStepsResults[stepID]);
        }
    }

    //Set the default test results
    this.resetTestExecutionData = function() {
        VisualBlocks.executor.testExecution = [];
        VisualBlocks.executor.testExecution.currentTest = 'default';
        VisualBlocks.executor.testExecution.results = {};

        //Holds the current JavaScript interpreter
        VisualBlocks.executor.testExecution.jsInterpreter = null;

        //Holds the headless workspace that contains the running test
        VisualBlocks.executor.testExecution.runningTestWorkspace = null;

        //Reference to the prompt simulator block
        VisualBlocks.executor.testExecution.promptSimulator = {};
        VisualBlocks.executor.testExecution.promptSimulator.next = 0;
        VisualBlocks.executor.testExecution.promptSimulator.block = null;

        //Stack of alert data
        VisualBlocks.executor.testExecution.alerts = {};
        VisualBlocks.executor.testExecution.alerts.output = [];
    }
}
