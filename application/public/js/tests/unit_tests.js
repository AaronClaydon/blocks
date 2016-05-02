// QUnit.module("Puzzles Manager");
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
