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
  },

  refresh: function(link) {
    AppDispatcher.refreshLink({
      action: 'refresh-link',
      link: link
    });
  },


};

module.exports = APIActions;