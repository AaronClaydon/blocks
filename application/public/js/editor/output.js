/*
** Visual Blocks Testing Environment
** Aaron Claydon
**
** editor/output.js
**
** Manages output panel
*/

function Output(dom) {
    this._dom = dom; //DOM element for the output panel
    this.empty = true; //Whether or not the panel is empty

    //Write a given string to the output panel
    this.write = function(text) {
        this.empty = false; //Panel is now not empty
        this._dom.append(text); //Add to the end of the panel content

        //Scroll to the bottom of the output panel
        var height = this._dom[0].scrollHeight;
        this._dom.scrollTop(height);
    };

    //Writes a given string and a line break to the output panel
    this.writeLine = function(text) {
        text = text || ''; //allows you to just print a linebreak
        this.write(text + '<br />');
    }

    //Only print linebreak if the output panel is empty
    this.lineBreakIfEmpty = function() {
        if(!this.empty) {
            this.writeLine();
        }
    }

    //Clear the output panel
    this.clear = function() {
        this.empty = true;
        this._dom.html('');
    }
}
