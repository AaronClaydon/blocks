//Puzzle Manager component
QUnit.module("Puzzles Manager");
QUnit.test("newWorkspaceNotPuzzle", function(assert) {
    VisualBlocks.puzzlesManager.newWorkspace();

    assert.notOk(VisualBlocks.currentPuzzle.isPuzzle);
});
QUnit.test("newPuzzleIsPuzzle", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();

    assert.ok(VisualBlocks.currentPuzzle.isPuzzle);
});
QUnit.test("loadPuzzle", function(assert) {
    VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle({
        id: "someID",
        name: "someName",
        description: "someDescription",
        isPuzzle: true,
        isPublished: true,
        steps: {
            "mAA(b,cnmp3G;M19bI/_": {
                "title": "Testing",
                "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
                "visibility": "visible",
                "order": 0,
                "sticky": false
            }
        },
        tests: {
            "sometest": {
                name: "someTestName",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>"
            },
            "anothertest": {
                name: "otherTestName",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>"
            }
        },
        options: {
            applicationCodeVisible: false,
            applicationCodeEditable: false,
            testCodeVisible: false,
            testCodeEditable: false,
            testListEditable: false
        }
    }));

    assert.equal(VisualBlocks.currentPuzzle.id, "someID", "ID");
    assert.equal(VisualBlocks.currentPuzzle.name, "someName", "Name");
    assert.equal(VisualBlocks.currentPuzzle.description, "someDescription", "Description");
    assert.ok(VisualBlocks.currentPuzzle.isPuzzle, "isPuzzle");
    assert.ok(VisualBlocks.currentPuzzle.isPublished, "isPublished");

    assert.equal(VisualBlocks.currentPuzzle.tests["sometest"].name, "someTestName", "test name matches");
    assert.equal(VisualBlocks.currentPuzzle.tests["sometest"].testCode, "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>", "test code matches");

    assert.equal(Object.keys(VisualBlocks.currentPuzzle.steps).length, 1, "steps length");
    assert.equal(Object.keys(VisualBlocks.currentPuzzle.tests).length, 2, "test length");

    assert.notOk(VisualBlocks.currentPuzzle.options.applicationCodeVisible, "option.applicationCodeVisible");
    assert.notOk(VisualBlocks.currentPuzzle.options.applicationCodeEditable, "option.applicationCodeEditable");
    assert.notOk(VisualBlocks.currentPuzzle.options.testCodeVisible, "option.testCodeVisible");
    assert.notOk(VisualBlocks.currentPuzzle.options.testCodeEditable, "option.testCodeEditable");
    assert.notOk(VisualBlocks.currentPuzzle.options.testListEditable, "option.testListEditable");
});
QUnit.test("loadPuzzleFromFile", function(assert) {
    assert.expect(2);
    var done1 = assert.async();
    var done2 = assert.async();

    VisualBlocks.puzzlesManager.loadPuzzleFromFile("/puzzles/set/introApp1.vbpuz", function() {
        assert.equal(VisualBlocks.currentPuzzle.id, "introApp1", "ID");
        done1();

        assert.equal(VisualBlocks.currentPuzzle.name, "Intro to Blocks", "Name");
        done2();
    });
});
QUnit.test("editStep", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();

    var testStep = {
        "title": "Testing",
        "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
        "visibility": "visible",
        "order": 0,
        "sticky": false
    };
    VisualBlocks.puzzlesManager.editStep("testStep", testStep);

    assert.equal(VisualBlocks.currentPuzzle.steps["testStep"], testStep);
});
QUnit.test("deleteStep", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();

    var testStep = {
        "title": "Testing",
        "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
        "visibility": "visible",
        "order": 0,
        "sticky": false
    };
    VisualBlocks.puzzlesManager.editStep("testStep", testStep);
    VisualBlocks.puzzlesManager.deleteStep("testStep");

    assert.equal(VisualBlocks.currentPuzzle.steps["testStep"], undefined);
});
QUnit.test("moveStep", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();

    VisualBlocks.puzzlesManager.editStep("testStep0", {
        "title": "Testing",
        "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
        "visibility": "visible",
        "order": 0,
        "sticky": false
    });
    VisualBlocks.puzzlesManager.editStep("testStep1", {
        "title": "Testing",
        "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
        "visibility": "visible",
        "order": 1,
        "sticky": false
    });

    VisualBlocks.puzzlesManager.moveStep("testStep0", "down");
    assert.equal(VisualBlocks.currentPuzzle.steps["testStep0"].order, 1, "down");
    VisualBlocks.puzzlesManager.moveStep("testStep0", "up");
    assert.equal(VisualBlocks.currentPuzzle.steps["testStep0"].order, 0, "up");
});
QUnit.test("updateStep", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();

    var testStep = {
        "title": "Testing",
        "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
        "visibility": "visible",
        "order": 0,
        "sticky": false,
        "successCondition": {

        }
    };
    VisualBlocks.puzzlesManager.editStep("testStepUpdate", testStep);

    assert.notOk(VisualBlocks.currentPuzzle.complete, "puzzle not complete");
    assert.notOk(VisualBlocks.currentPuzzle.steps["testStepUpdate"].completed, "step incomplete");

    VisualBlocks.puzzlesManager.updateStep("testStepUpdate", true);
    assert.ok(VisualBlocks.currentPuzzle.steps["testStepUpdate"].completed, "step complete");
    assert.ok(VisualBlocks.currentPuzzle.complete, "puzzle complete");
});
QUnit.test("newTest", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();
    var testID = VisualBlocks.puzzlesManager.newTest("addedTest");

    assert.equal(VisualBlocks.currentPuzzle.tests[testID].name, "addedTest");
});
QUnit.test("deleteTest", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();
    var testID = VisualBlocks.puzzlesManager.newTest("addedTest");
    VisualBlocks.puzzlesManager.deleteTest(testID);

    assert.equal(VisualBlocks.currentPuzzle.tests[testID], undefined);
});
QUnit.test("executeEventEquality", function(assert) {
    var trueEquality = VisualBlocks.puzzlesManager.executeEventEquality(
        {numTests: "1", numPassed: "1"},
        {numTests: "1", numPassed: "1", fakeValue: "2"}
    );

    assert.ok(trueEquality, "true");

    var falseEquality = VisualBlocks.puzzlesManager.executeEventEquality(
        {numTests: "2", numPassed: "1"},
        {numTests: "1", numPassed: "1", fakeValue: "2"}
    );

    assert.notOk(falseEquality, "false");
});

//Executor component
QUnit.module("Executor");
QUnit.test("resetTestExecutionData", function(assert) {
    VisualBlocks.executor.resetTestExecutionData();

    assert.equal(VisualBlocks.executor.testExecution.currentTest, "defaul1", "default test running");
    assert.equal(Object.keys(VisualBlocks.executor.testExecution.results).length, 0, "empty results");
});
QUnit.test("executeApplication", function(assert) {
    VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle({
        id: "someID",
        name: "someName",
        description: "someDescription",
        isPuzzle: true,
        isPublished: true,
        applicationCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"text_print\" x=\"12\" y=\"7\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">abc</field></shadow><block type=\"text\"><field name=\"TEXT\">test print output</field></block></value></block></xml>",
        steps: {
        },
        tests: {
            "sometest": {
                name: "someTestName",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>"
            }
        },
        options: {
            applicationCodeVisible: true,
            applicationCodeEditable: true,
            testCodeVisible: true,
            testCodeEditable: true,
            testListEditable: true
        }
    }));

    VisualBlocks.executor.executeApplication();

    assert.equal(VisualBlocks.executor.testExecution.alerts.output[0], "test print output");
});
QUnit.test("executeAllTests", function(assert) {
    VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle({
        id: "someID",
        name: "someName",
        description: "someDescription",
        isPuzzle: true,
        isPublished: true,
        applicationCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"procedures_defreturn\" x=\"20\" y=\"13\"><mutation><arg name=\"x\"></arg></mutation><field name=\"NAME\">someTestFunction</field><comment pinned=\"false\" h=\"80\" w=\"160\">Describe this function...</comment><statement name=\"STACK\"><block type=\"controls_if\"><mutation else=\"1\"></mutation><value name=\"IF0\"><block type=\"logic_compare\"><field name=\"OP\">EQ</field><value name=\"A\"><block type=\"variables_get\"><field name=\"VAR\">x</field></block></value><value name=\"B\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value></block></value><statement name=\"DO0\"><block type=\"variables_set\"><field name=\"VAR\">returnValue</field><value name=\"VALUE\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></statement><statement name=\"ELSE\"><block type=\"variables_set\"><field name=\"VAR\">returnValue</field><value name=\"VALUE\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></statement></block></statement><value name=\"RETURN\"><block type=\"variables_get\"><field name=\"VAR\">returnValue</field></block></value></block></xml>",
        steps: {
        },
        tests: {
            "test1": {
                name: "test1",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"assert\" x=\"9\" y=\"13\"><value name=\"ASSERT_SUCCESS_VALUE\"><block type=\"procedures_callreturn\"><mutation name=\"someTestFunction\"><arg name=\"x\"></arg></mutation><value name=\"ARG0\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value></block></value><value name=\"ASSERT_SUCCESS_IF\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></xml>"
            },
            "test2": {
                name: "test2",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"assert\" x=\"9\" y=\"13\"><value name=\"ASSERT_SUCCESS_VALUE\"><block type=\"procedures_callreturn\"><mutation name=\"someTestFunction\"><arg name=\"x\"></arg></mutation><value name=\"ARG0\"><block type=\"math_number\"><field name=\"NUM\">20</field></block></value></block></value><value name=\"ASSERT_SUCCESS_IF\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></xml>"
            },
            "test3": {
                name: "test3",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"><block type=\"assert\" x=\"9\" y=\"13\"><value name=\"ASSERT_SUCCESS_VALUE\"><block type=\"procedures_callreturn\"><mutation name=\"someTestFunction\"><arg name=\"x\"></arg></mutation><value name=\"ARG0\"><block type=\"math_number\"><field name=\"NUM\">19</field></block></value></block></value><value name=\"ASSERT_SUCCESS_IF\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></xml>"
            }
        },
        options: {
            applicationCodeVisible: true,
            applicationCodeEditable: true,
            testCodeVisible: true,
            testCodeEditable: true,
            testListEditable: true
        }
    }));

    VisualBlocks.executor.executeAllTests();

    assert.ok(VisualBlocks.executor.testExecution.results["test1"].success, "test1");
    assert.notOk(VisualBlocks.executor.testExecution.results["test2"].success, "test2");
    assert.ok(VisualBlocks.executor.testExecution.results["test3"].success, "test3");

    assert.ok(VisualBlocks.executor.testExecution.results["test1"].variables["returnValue2"].data, "test1 returnValue");
    assert.ok(VisualBlocks.executor.testExecution.results["test2"].variables["returnValue2"].data, "test2 returnValue");
    assert.notOk(VisualBlocks.executor.testExecution.results["test3"].variables["returnValue2"].data, "test3 returnValue");

    assert.ok($.inArray("101-163", VisualBlocks.executor.testExecution.branchesHit), "branch 1 hit");
    assert.ok($.inArray("169-232", VisualBlocks.executor.testExecution.branchesHit), "branch 2 hit");
});

//Workspaces component
QUnit.module("Workspaces");
QUnit.test("blocklyWorkspaceOptions", function(assert) {
    VisualBlocks.puzzlesManager.loadPuzzle(new Puzzle({
        id: "someID",
        name: "someName",
        description: "someDescription",
        isPuzzle: true,
        isPublished: true,
        steps: {
            "mAA(b,cnmp3G;M19bI/_": {
                "title": "Testing",
                "description": "Software testing allows you to identify code that does not function as intended and is an important and necessary step when writing code.\n<br/><br/>\nThese bugs could be from simple typos, logical errors, or a misunderstanding of the requirements. These bugs might not be easily identifiable from just reading the code, which is why with software testing you execute code and compare the output to what you expected",
                "visibility": "visible",
                "order": 0,
                "sticky": false
            }
        },
        tests: {
            "sometest": {
                name: "someTestName",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>"
            },
            "anothertest": {
                name: "otherTestName",
                testCode: "<xml xmlns=\"http://www.w3.org/1999/xhtml\"></xml>"
            }
        },
        options: {
            applicationCodeVisible: false,
            applicationCodeEditable: false,
            testCodeVisible: false,
            testCodeEditable: false,
            testListEditable: false
        }
    }));

    assert.ok(VisualBlocks._workspaces.appWorkspace.options.readOnly, "app readonly");
    assert.ok(VisualBlocks._workspaces.testWorkspace.options.readOnly, "test readonly");
});

//UI component
QUnit.module("UI");
QUnit.test("outputExpanded", function(assert) {
    assert.ok(VisualBlocks.ui.outputExpanded, "inital open");

    VisualBlocks.ui.toggleCollapseOutputPanel();
    assert.notOk(VisualBlocks.ui.outputExpanded, "closed");

    VisualBlocks.ui.toggleCollapseOutputPanel();
    assert.ok(VisualBlocks.ui.outputExpanded, "open");
});
QUnit.test("puzzleName", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();
    VisualBlocks.currentPuzzle.name = "changed name";
    VisualBlocks.ui.updatePuzzleName();

    assert.equal($("#application-current-name").text(), "changed name");
});
QUnit.test("renderTemplate", function(assert) {
    assert.equal(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: false,
        success: false,
        unhandledPrompt: false
    }).trim(), "<span class=\"bg-danger\">FAILED - NO ASSERT</span>", "test output - no assert");

    assert.equal(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: true,
        success: true,
        unhandledPrompt: false
    }).trim(), "<span class=\"bg-success\">SUCCESS</span>", "test output - success");

    assert.ok(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: true,
        success: false,
        unhandledPrompt: false
    }).indexOf("FAILED") > -1, "test output - failed");

    assert.ok(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: true,
        success: false,
        unhandledPrompt: true
    }).indexOf("- UNHANDLED PROMPT") > -1, "test output - failed unhandled prompt");
});
QUnit.test("formatTestResult", function(assert) {
    VisualBlocks.puzzlesManager.newPuzzle();
    VisualBlocks.executor.testExecution.results["defaul1"] = {};

    assert.equal(VisualBlocks.ui.formatTestResult("defaul1").trim(), "<span class=\"bg-danger\">FAILED - NO ASSERT</span>", "test output - no assert");

    VisualBlocks.executor.testExecution.results["defaul1"].assertion = true;
    VisualBlocks.executor.testExecution.results["defaul1"].success = true;
    VisualBlocks.executor.testExecution.results["defaul1"].unhandledPrompt = false;
    assert.equal(VisualBlocks.ui.formatTestResult("defaul1").trim(), "<span class=\"bg-success\">SUCCESS</span>", "test output - success");

    VisualBlocks.executor.testExecution.results["defaul1"].success = false;
    assert.ok(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: true,
        success: false,
        unhandledPrompt: false
    }).indexOf("FAILED") > -1, "test output - failed");

    VisualBlocks.executor.testExecution.results["defaul1"].unhandledPrompt = true;
    assert.ok(VisualBlocks.ui.renderTemplate("test-formatted-output", {
        assertion: true,
        success: false,
        unhandledPrompt: true
    }).indexOf("- UNHANDLED PROMPT") > -1, "test output - failed unhandled prompt");
});

//Output component
QUnit.module("Output");
QUnit.test("initialEmpty", function(assert) {
    VisualBlocks.output.clear(); //reset

    assert.ok(VisualBlocks.output.empty);
});
QUnit.test("writeNotEmpty", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.write("test string");
    assert.notOk(VisualBlocks.output.empty);
});
QUnit.test("writeLineNotEmpty", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.writeLine("test string");
    assert.notOk(VisualBlocks.output.empty);
});
QUnit.test("writeClearEmpty", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.write("test string");
    VisualBlocks.output.clear();
    assert.ok(VisualBlocks.output.empty);
});
QUnit.test("writeLineClearEmpty", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.writeLine("test string");
    VisualBlocks.output.clear();
    assert.ok(VisualBlocks.output.empty);
});
QUnit.test("writePaneContainsString", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.write("test string");
    assert.equal($("#output").text(), "test string");
});
QUnit.test("writeLinePaneContainsString", function(assert) {
    VisualBlocks.output.clear(); //reset

    VisualBlocks.output.writeLine("test string");
    assert.equal($("#output").html(), "test string<br>");
});
