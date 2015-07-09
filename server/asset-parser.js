var request = require('request');
var cheerio = require('cheerio');
var reporter = require('./reporter')
/*
 * Gets html from request and passes it on for parsing
 * @{link} string - the url to go to
 * @{callback} function - the function to call with the parsed asset links (array)
 * @{error} function - the function to call for errors
*/
function assetParser(link, callback, error) {
  var data;
  var statusCode;
  var req = request(link)
    .on('response', function(res) {
      statusCode = res.statusCode;
    })
    .on('data', function(d) {
      if(!data) data = d;
      data += d;
    })
    .on('end', function(d) {
      var assetLinks = getAssetLinks(data);
      var report = reporter.report('json', assetLinks, statusCode);
      callback(link, report);
    })
    .on('error', error)
}

/*
 * Parses an html doc and returns
 * values (src & href) found in <link> and <script>
 * @{str} string - the html response from a request
*/
function getAssetLinks(str) {
  var urls = [];
  var $ = cheerio.load(str);

  $('link, script, img').each(function(i, link) {
    if($(link).attr('href')) { 
      urls.push($(link).attr('href'))
    }
    if($(link).attr('src')) {
      urls.push($(link).attr('src'));
    }
  });
  
  return urls;
}

function defaultResponse() {
  return {
    link: '',
    links: [],
    mixedContent: false,
  }
}

module.exports = assetParser;