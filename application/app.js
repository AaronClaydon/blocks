var express = require('express');
var app = express();
var fs = require('fs');

//static files
app.use(express.static(__dirname + '/public'));

//app routes
app.get('/', function(req, res) {
    res.sendFile('views/index.html', {root: __dirname});
});
app.get('/puzzles_list.json', function(req, res) {
    fs.readFile('public/puzzles/set/list.json', 'utf8', function (err, data) {
        var puzzlesList = [];
        var puzzleNames = JSON.parse(data);

        for (var i = 0; i < puzzleNames.length; i++) {
            var puzzleName = puzzleNames[i];
            var fileName = '/puzzles/set/' + puzzleName + '.vbpuz';
            var puzzle = JSON.parse(fs.readFileSync('public' + fileName, 'utf8'));

            puzzlesList.push({
                id: puzzleName,
                fileName: fileName,
                name: puzzle.name,
                description: puzzle.description
            });
        }

        res.end(JSON.stringify(puzzlesList));
    });
});
app.get('/editor', function(req, res) {
    res.sendFile('views/editor.html', {root: __dirname});
});

app.listen(3000);
console.log('Listening on port 3000');
