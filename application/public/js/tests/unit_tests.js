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

//
// QUnit.test( "hello test", function( assert ) {
//     assert.ok( 1 == "1", "Passed!" );
// });
//
//
// QUnit.module("Executor");
//
// QUnit.module("Workspaces");
//
// QUnit.module("UI");

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
