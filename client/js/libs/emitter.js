function emitter() {
  var events = {};

  return {
    on: function(eventName, callback, scope) {
      if(!eventName) throw new Error('Event name is required');
      if(!callback) throw new Error('Callback is required');

      if(!events.hasOwnProperty(eventName)) {
        events[eventName] = [];
      }
      events[eventName].push({callback:callback, scope:scope});
    },

    emit: function(event, data) {
      if(!events.hasOwnProperty(event)) return;
      events[event].forEach(function(listener) {
        listener.callback.call(listener.scope, data);
      });
    },

    off: function(eventName, callback) {
      if(events.hasOwnProperty(eventName)) {
        var arr = events[eventName];
        arr.forEach(function(listener, index) {
          if(listener.callback === callback) {
            arr.splice(index, 1);
          }
        });
      }
    },

    getEvents: function() {
      return events;
    },

    remove: function() {
      events = null;
    }
  };
}

module.exports = emitter;