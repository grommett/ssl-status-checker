
function jsonReport(links, statusCode) {
  var report = {
    warnings: [],
    failing: [],
    uncategorized: [],
    status: undefined,
    statusCode: statusCode
  };

  links.filter(function(link) {
    if(link.indexOf('http://') !== -1) return true
    return false;
  })
  .map(function(link){
    if(isImage(link)) {
     report.warnings.push(link);
    }else if(isCSSorJS(link)){
      report.failing.push(link);
    }else{
      report.uncategorized.push(link);
    }
  })

  if(report.failing.length > 0 || statusCode === 404) {
    report.status = 'failing'
    return report;
  }

  if(report.failing.length === 0 && report.warnings.length === 0) {
    report.status = 'passing';
    return report;
  }

  report.status = 'warning';
  return report;

}

function isImage(str) {
  return (/\.(gif|jpg|jpeg|tiff|png|ico)/i).test(str)
}

function isCSSorJS(str) {
  return (/\.(js|css)/i).test(str)
}


module.exports = {
  report: function(type, links, statusCode) {
    type = type || 'json';
    if(type === 'json') return jsonReport(links, statusCode);
  }
}