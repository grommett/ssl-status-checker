var assert = require('assert');
var reporter = require('../../server/reporter');

describe('reporter', function() {
  it('should report a status of \'failure\' if the file type is .js and url contains http://', function(done) {
    var report = reporter.report('json', ['http://www.script.com/script.js'], 200);
    assert.equal(report.status, 'failing')
    done();
  })

  it('should add failing links to the failing array for .js files', function(done) {
    var failingLink1 = 'http://www.script.com/script.js';
    var failingLink2 = 'http://www.script2.com/script2.js';
    var report = reporter.report('json', [failingLink1, failingLink2], 200);
    assert.equal(report.status, 'failing');
    assert.equal(report.failing.length, 2);
    assert.equal(report.failing[0], failingLink1);
    assert.equal(report.failing[1], failingLink2);
    done();
  });

  it('should report a status of \'failure\' if the file type is .css and url contains http://', function(done) {
    var report = reporter.report('json', ['http://www.css.com/style.css'], 200);
    assert.equal(report.status, 'failing')
    done();
  });

  it('should add failing links to the failing array for .css files', function(done) {
    var failingLink1 = 'http://www.css.com/style.css';
    var failingLink2 = 'http://www.css2.com/style2.css';
    var report = reporter.report('json', [failingLink1, failingLink2], 200);
    assert.equal(report.status, 'failing');
    assert.equal(report.failing.length, 2);
    assert.equal(report.failing[0], failingLink1);
    assert.equal(report.failing[1], failingLink2);
    done();
  });

})