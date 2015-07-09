var tabletop = require('tabletop');


module.exports = {
  getLinks: function(data, callback) {
    if(typeof(data) === 'string') {
      tabletop.init({
        key: data,
        callback: callback,
        simpleSheet: true
      })
    }
  }

}