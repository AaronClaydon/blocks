function WorkSpaces() {
    function createWorkspace(area, workspace, toolbox) {
        var blocklyArea = document.getElementById(area);
        var blocklyDiv = document.getElementById(workspace);
        var workspace = Blockly.inject(blocklyDiv, {toolbox: document.getElementById(toolbox), workspaceType: workspace});
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

    this.init = function() {
        this.generateToolboxes();

        this.appWorkspace = createWorkspace('application-panel', 'application-blockly', 'blockly-application-toolbox');
        this.testWorkspace = createWorkspace('testing-panel', 'testing-blockly', 'blockly-testing-toolbox');
    };

    //Generate Blockly toolboxes by merging type specific and shared toolboxes
    this.generateToolboxes = function() {
        //Get XML from document
        var shared = $("#blockly-shared-toolbox").html();
        var applicationOnly = $("#blockly-application-only-toolbox").html();
        var testOnly = $("#blockly-testing-only-toolbox").html();

        //Merged them together
        var applicationToolbox = shared + applicationOnly;
        var testToolbox = shared + testOnly;

        //Create elements in the DOM with these new toolboxes for Blockly to use
        $('body').append('<xml id="blockly-application-toolbox" style="display: none">' + applicationToolbox + '</xml>');
        $('body').append('<xml id="blockly-testing-toolbox" style="display: none">' + testToolbox + '</xml>');
    };

    this.loadApplication = function(code) {
        this.appWorkspace.clear();
        Blockly.Xml.domToWorkspace(this.appWorkspace, Blockly.Xml.textToDom(code));
    };

    this.loadTest = function(code) {
        this.testWorkspace.clear();
        Blockly.Xml.domToWorkspace(this.testWorkspace, Blockly.Xml.textToDom(code));
    };
}
