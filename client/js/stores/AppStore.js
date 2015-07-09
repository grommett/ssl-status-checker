var emitter = require('../libs/emitter')();
var dispatcher = require('../dispatcher');
var objectAssign = require('object-assign');

var pages = links.map(function(link) {
  return {
    url: link.url,
    report: {
      status: 'loading',
      warnings:[], 
      failing:[], 
      uncategorized: [],
      statusCode: 0
    }
  }
});

var state = {
  filters: [],
  status: 'loading',
  pages: pages
};

AppStore = {
  on: emitter.on,

  emitChange: function() {
    var clonedState = objectAssign({}, state);
    emitter.emit('change', clonedState);
  },

  state: function() {
    var clonedState = objectAssign({}, state);
    return clonedState;
  },

  dispatcherIndex: dispatcher.register(function(payload) {
    var action = payload.action;
    if(action === 'api-response') {
      var pageURL = payload.data.pageURL;
      state.pages.map(function(page) {
        if(page.url === pageURL) {
          console.log('dispatcher ', payload);
          page.report = payload.data.report;
        }
      });
    }
    AppStore.emitChange();
    return true;
  })
}

module.exports = AppStore;