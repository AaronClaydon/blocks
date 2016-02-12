function Output(dom) {
    this._dom = dom;
    this.empty = true;

    this.write = function(text) {
        this.empty = false;
        this._dom.append(text);
        var height = this._dom[0].scrollHeight;
        this._dom.scrollTop(height);
    };

    this.writeLine = function(text) {
        text = text || '';
        this.write(text + '<br />');
    }

    this.lineBreakIfEmpty = function() {
        if(!this.empty) {
            this.writeLine();
        }
    }

    this.clear = function() {
        this.empty = true;
        this._dom.html('');
    }
}
