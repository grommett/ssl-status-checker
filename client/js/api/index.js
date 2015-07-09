var endPoint = '/api/';
var qwest = require('qwest');
var apiActions = require('../actions/api-action');
var que = require('../libs/que');
/*
 * The var links is global and is written to the page response from the server
 * after it's queried the Google spreadheet. Adds the links array values to the que.
*/
links.map(function(link) {
  que.add(link);
})

/*
 * Recursive. Moves through the que pinging server api
 * until there are no more links in the que object.
 * Sends response data via an 'action' to the dispatcher.
 * @See ./actions/api-action
*/
function query() {
  var queItem = que.next();
  if(queItem) {
    qwest.get(endPoint+encodeURIComponent(queItem.url))
    .then(function(response) {
      apiActions.response({pageURL: queItem.url, report: response});
      query();
    })
    .catch(function(e, response) {
      console.log('>> Error: ', e, '\nResponse: ', response);
    })
  }else{
    console.log('Done!');
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