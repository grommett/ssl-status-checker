var head = false;
var index = 0;
var items = [];

module.exports = {
  add: function(item) {
    items.push(item);
    return this;
  },

  next: function() {
    if(!head) {
      head = items[0];
      return head;
    }

    if(items[index+1]) {
      return items[++index];
    }
    return false;
  }
};