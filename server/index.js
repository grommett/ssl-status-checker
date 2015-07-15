var express = require('express');
var app = express();
var mixedContent = require('./index');
var spreadsheetURL = 'https://docs.google.com/spreadsheets/d/1sN0uGj5JNtvhU76X9NZ2gkU5rxzAMcEMA_dXnj0L5x8/pubhtml';
var tabletop = require('tabletop');
var assetParser = require('./asset-parser');
var port = process.env.PORT || 3000;

app.set('view engine', 'jade');
app.set('views', __dirname +'/views');
app.use(express.static(__dirname + '/public'));


// home
app.get('/', function (req, res) {
  tabletop.init({
    key: spreadsheetURL,
    callback: function(d) {
      res.set('Content-Type', 'text/html');
      res.render('index', { title: 'Status', message: 'Status', data: JSON.stringify(d)});
    },
    simpleSheet: true
  })
});

// API status for a given url
app.get('/api/:url', function (req, res) {
  assetParser(req.params.url, function(link, data) {
    res.json({url: link, data: data});
  }, function(e) {
    res.json(e);
  })
});


module.exports = {
  start: function() {
    var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});
  }
}