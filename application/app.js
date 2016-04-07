var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var guid = require('guid');
var app = express();

//Parse POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//static files
app.use(express.static(__dirname + '/public'));

//app routes
app.get('/', function(req, res) {
    res.sendFile('views/index.html', {root: __dirname});
});
app.get('/puzzles_list.json', function(req, res) {
    //Get the ordered list of puzzles
    fs.readFile('public/puzzles/set/list.json', 'utf8', function (err, data) {
        var puzzlesList = [];
        var puzzleNames = JSON.parse(data);

        //For each puzzle add the name and description to the returned data
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
app.get('/editor/:puzzleID?', function(req, res) {
    res.sendFile('views/editor.html', {root: __dirname});
});

app.post('/publish_puzzle', function(req, res) {
    //Unique ID for the puzzle
    var id = guid.raw();

    //Write the puzzle to the disk as the ID as the filename
    fs.writeFile('public/puzzles/user/' + id + '.vbpuz', req.body.puzzle, function(err) {
        if(err) {
            return console.log(err);
        }

        //Send the puzzle id to the user
        res.end(id);
    });
});

app.listen(3000);
console.log('Listening on port 3000');
