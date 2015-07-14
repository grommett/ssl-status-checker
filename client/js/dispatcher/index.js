var FluxDispatcher = require('flux').Dispatcher;
var objectAssign = require('object-assign');

objectAssign(FluxDispatcher.prototype, {
  handleAPIresponse: function(response) {
    this.dispatch(response)
  },

  handleFilter: function() {

  }

})

module.exports = new FluxDispatcher();