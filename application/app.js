var express = require('express');
var app = express();

//static files
app.use(express.static(__dirname + '/public'));

//app routes
app.get('/', function(req, res){
    res.sendFile('views/index.html', {root: __dirname});
});
app.get('/puzzles', function(req, res){
    res.sendFile('views/puzzles.html', {root: __dirname});
});
app.get('/editor', function(req, res){
    res.sendFile('views/editor.html', {root: __dirname});
});

app.listen(3000);
console.log('Listening on port 3000');
