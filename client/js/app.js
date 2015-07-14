var StatusHeader = require('./components/StatusHeader');
var StatusItem = require('./components/StatusItem');
var Store = require('./stores/AppStore');
var WebApi = require('./api')();


Status = React.createClass({
  getInitialState: function() {
    return Store.state();
  },

  componentDidMount: function() {
    Store.on('change', this._onChange);
  },

  render: function() {
    var pages = this.state.pages;
    var items = pages.map(function(page, index) {
      return (
        <StatusItem key={index} 
          report={page.report}
          link={page.url} />
      )
    });

    return (
      <section>
        <StatusHeader pages={pages} />
        <ul className="status-list">
          {items}
        </ul>
      </section>
    )
  },

  _onChange: function(d) {
    this.setState(d);
  }
})

React.render(<Status />, document.getElementById('mount'));
WebApi.query();