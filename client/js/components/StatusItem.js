var StatusItem = React.createClass({
  
  getDefaultProps: function() {
    return {
      assetURLs: []
    }
  },

  getInitialState: function() {
    return {
      hidden: true
    }
  },

  render: function() {
    var self = this;
    var report = this.props.report;
    return (
      <li className={'status-item '+self._getClasses()}>
        <a target="_blank" href={this.props.link}>{this.props.link}</a>
        {this._reportStatusCode()}
        {this._getButton()}
        {this._getList(report.failing)}
        {this._getList(report.warnings)}
      </li>
    );
  },

  _getList: function(list) {
    if(list.length === 0) return 
    var assetUrlList = list.map(function(url) {
      return (
        <li className="asset-urls-item">{url}</li>
      )
    });
    return (
      <ol className={'asset-urls-list details '+this._getVisiblity()}>
        {assetUrlList}
      </ol>
    )
  },

  _getButton: function() {
    var status = this.props.report.status;
    if(status === 'failing' || status === 'warning')
    return (
      <button className="details-button" onClick={this._onShowDetails}>Details</button>
    )
  },

  _getClasses: function(base) {
    var status = this.props.report.status;
    if(status === 'failing') return 'failing';
    if(status === 'warning') return 'warning';
    if(status === 'passing') return 'passing';
    if(status === 'loading') return 'loading';
  },

  _reportStatusCode: function() {
    var statusCode = this.props.report.statusCode;
    if(statusCode === 404) return ' (404)';
    if(statusCode === 0) return ' (loading...)';
    return '';
  },

  _getVisiblity: function() {
    if(this.state.hidden) return 'details-hidden';
    return 'details-visible';
  },

  _onShowDetails: function() {
    var hidden = !this.state.hidden;
    this.setState({hidden: hidden});
  }
});

module.exports = StatusItem;