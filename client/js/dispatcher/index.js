var FluxDispatcher = require('flux').Dispatcher;
var objectAssign = require('object-assign');

objectAssign(FluxDispatcher.prototype, {
  handleAPIresponse: function(response) {
    console.log('handleAPIresponse');
    this.dispatch(response)
  },

  handleFilter: function() {

  }

})

module.exports = new FluxDispatcher();