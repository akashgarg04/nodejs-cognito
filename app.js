var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes/routes');
require('./config/config')();


var app = express();
app.get('/', (req, res) => res.send('Hello from nodejs application server'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', routes);
module.exports = app;

var app = require('./app');
var server = app.listen(3000, function(){
     console.log("Server is running on port 3000");
});


