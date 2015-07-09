var StatusHeader = React.createClass({
  render: function() {
    var loaded = this._getLoaded();
    return (
      <div className="status-header">
        Checking Status for {this.props.pages.length} links.
        {' '+loaded + ' page(s) loaded. '+Math.floor((loaded/this.props.pages.length)*100)+'% loaded.'}
        <br />{this._getPercent('passing')+'% passing.'}
        <br />{this._getPercent('failing')+'% failing.'}
        <br />{this._getPercent('warning')+'% warnings.'}
      </div>
    )
  },

  _getLoaded : function() {
    var total = 0;
    var word = ''
    var loadedPages = this.props.pages.filter(function(page) {
      if(page.report.status !== 'loading') return true
      return false;
    })
    return loadedPages.length;
  },

  _getPercent : function(status) {
    var matchingPages = this.props.pages.filter(function(page) {
      if(page.report.status === status) return true
      return false;
    })
    return Math.floor((matchingPages.length/this.props.pages.length)*100);
  }
});

module.exports = StatusHeader;