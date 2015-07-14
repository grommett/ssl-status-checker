/**
 * APIActions
 */

var AppDispatcher = require('../dispatcher');

var APIActions = {
  /**
   * @param  {data} object
   */
  response: function(data) {
    AppDispatcher.handleAPIresponse({
      action: 'api-response',
      data: data
    });
  }
};

module.exports = APIActions;