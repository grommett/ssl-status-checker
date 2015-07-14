var endPoint = '/api/';
var qwest = require('qwest');
var apiActions = require('../actions/api-action');
var que = require('../libs/que');
var maxRequests = 100;
var linkArr = []
/*
 * The var links is global and is written to the page response from the server
 * after it's queried the Google spreadheet. Adds the links array values to the que.
*/
links.forEach(function(link) {
  linkArr.push(link.url);
})


function query() {
  batchRequest();
}

/*
 * Loop through the links array
 * removing the first item in every iteration
*/
function batchRequest(){
  // Use the lower value of items left in the link array or maxRequests
  var total = (linkArr.length-1 > maxRequests) ? maxRequests : linkArr.length-1;
  for(var i = 0; i<= total; i++) {
    qwest.get(endPoint+encodeURIComponent(linkArr[0]))
      .then(function(response) {
        apiActions.response({pageURL: response.url, report: response.data});
      })
      .catch(function(e, response) {
        console.log('>> Error: ', e, '\nResponse: ', response);
      })
    // Remove the head from the array
    linkArr.shift();
  }

  // Batch request again if there's anything left in the array
  if(linkArr.length > 0) {
    setTimeout(function() {
      batchRequest();
    }, 30*1000);
  }
}


function api() {
  return {
    query: function() {
      query();
    }
  }
}

module.exports = api;
