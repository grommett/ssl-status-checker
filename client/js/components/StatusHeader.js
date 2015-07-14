var StatusHeader = React.createClass({
  render: function() {
    var loaded = this._getLoaded();
    return (
      <div className="status-header">
        Checking Status for {this.props.pages.length} links.
        {' '+loaded + ' page(s) loaded. '+Math.floor((loaded/this.props.pages.length)*100)+'% loaded.'}
        <br />{this._getCount('passing')+' passing.'}
        <br />{this._getCount('failing')+' failing.'}
        <br />{this._getCount('warning')+' warnings.'}
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

  _getCount : function(status) {
    var matchingPages = this.props.pages.filter(function(page) {
      if(page.report.status === status) return true
      return false;
    })
    return matchingPages.length;
  }
});

module.exports = StatusHeader;