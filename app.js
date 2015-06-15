var browserify = require('browserify-middleware');
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();

// view engine setup
app.set('views','views');
app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

//static files
app.use(express.static(__dirname + '/public'));

//bundle the main client side app
app.get('/editor.js', browserify('./client/editor/main.js'));

//app routes
app.get('/', function(req, res){
    res.render('index');
});
app.get('/puzzles', function(req, res){
    res.render('puzzles');
});
app.get('/editor', function(req, res){
    res.render('editor');
});

app.listen(3000);
console.log('Listening on port 3000');
