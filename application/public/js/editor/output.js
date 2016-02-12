function Output(dom) {
    this._dom = dom;

    this.write = function(text) {
        this._dom.append(text);
        var height = this._dom[0].scrollHeight;
        this._dom.scrollTop(height);
    };

    this.writeLine = function(text) {
        this.write(text + '<br />');
    }

    this.clear = function() {
        this._dom.html('');
    }
}
