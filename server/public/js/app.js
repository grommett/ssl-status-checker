(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * APIActions
 */

var AppDispatcher = require('../dispatcher');

var APIActions = {
  /**
   * @param  {data} object
   */
  response: function(data) {
    AppDispatcher.handleAPIresponse({
      action: 'api-response',
      data: data
    });
  }
};

module.exports = APIActions;

},{"../dispatcher":6}],2:[function(require,module,exports){
var endPoint = '/api/';
var qwest = require('qwest');
var apiActions = require('../actions/api-action');
var que = require('../libs/que');
var maxRequests = 100;
var linkArr = []
/*
 * The var links is global and is written to the page response from the server
 * after it's queried the Google spreadheet. Adds the links array values to the que.
*/
links.forEach(function(link) {
  linkArr.push(link.url);
})


function query() {
  batchRequest();
}

/*
 * Loop through the links array
 * removing the first item in every iteration
*/
function batchRequest(){
  // Use the lower value of items left in the link array or maxRequests
  var total = (linkArr.length-1 > maxRequests) ? maxRequests : linkArr.length-1;
  for(var i = 0; i<= total; i++) {
    qwest.get(endPoint+encodeURIComponent(linkArr[0]))
      .then(function(response) {
        apiActions.response({pageURL: response.url, report: response.data});
      })
      .catch(function(e, response) {
        console.log('>> Error: ', e, '\nResponse: ', response);
      })
    // Remove the head from the array
    linkArr.shift();
  }

  // Batch request again if there's anything left in the array
  if(linkArr.length > 0) {
    setTimeout(function() {
      batchRequest();
    }, 30*1000);
  }
}


function api() {
  return {
    query: function() {
      query();
    }
  }
}

module.exports = api;

},{"../actions/api-action":1,"../libs/que":8,"qwest":14}],3:[function(require,module,exports){
var StatusHeader = require('./components/StatusHeader');
var StatusItem = require('./components/StatusItem');
var Store = require('./stores/AppStore');
var WebApi = require('./api')();


Status = React.createClass({displayName: "Status",
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
        React.createElement(StatusItem, {key: index, 
          report: page.report, 
          link: page.url})
      )
    });

    return (
      React.createElement("section", null, 
        React.createElement(StatusHeader, {pages: pages}), 
        React.createElement("ul", {className: "status-list"}, 
          items
        )
      )
    )
  },

  _onChange: function(d) {
    this.setState(d);
  }
})

// Render the react componenets to the page
React.render(React.createElement(Status, null), document.getElementById('mount'));

// Start querying the api for pages statuses
WebApi.query();

},{"./api":2,"./components/StatusHeader":4,"./components/StatusItem":5,"./stores/AppStore":9}],4:[function(require,module,exports){
var StatusHeader = React.createClass({displayName: "StatusHeader",
  render: function() {
    var loaded = this._getLoaded();
    return (
      React.createElement("div", {className: "status-header"}, 
        "Checking Status for ", this.props.pages.length, " links.", 
        ' '+loaded + ' page(s) loaded. '+Math.floor((loaded/this.props.pages.length)*100)+'% loaded.', 
        React.createElement("br", null), this._getCount('passing')+' passing.', 
        React.createElement("br", null), this._getCount('failing')+' failing.', 
        React.createElement("br", null), this._getCount('warning')+' warnings.'
      )
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

},{}],5:[function(require,module,exports){
var StatusItem = React.createClass({displayName: "StatusItem",
  
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
    var report = this.props.report;
    return (
      React.createElement("li", {className: 'status-item '+this._getClasses()}, 
        React.createElement("a", {target: "_blank", href: this.props.link}, this.props.link), 
        this._reportStatusCode(), 
        this._getButton(), 
        this._getList(report.failing, 'Failing'), 
        this._getList(report.warnings, 'Warnings')
      )
    );
  },

  _getList: function(list, header) {
    if(list.length === 0) return 
    var assetUrlList = list.map(function(url) {
      return (
        React.createElement("li", {className: "asset-urls-item"}, url)
      )
    });
    return (
      React.createElement("ol", {className: 'asset-urls-list details '+this._getVisiblity()}, 
        header, 
        assetUrlList
      )
    )
  },

  _getButton: function() {
    var status = this.props.report.status;
    if(status === 'failing' || status === 'warning')
    return (
      React.createElement("button", {className: "details-button", onClick: this._onShowDetails}, "Details")
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

},{}],6:[function(require,module,exports){
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

},{"flux":10,"object-assign":13}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var emitter = require('../libs/emitter')();
var dispatcher = require('../dispatcher');
var objectAssign = require('object-assign');

var pages = links.map(function(link) {
  return {
    url: link.url,
    report: {
      status: 'loading',
      warnings:[], 
      failing:[], 
      uncategorized: [],
      statusCode: 0
    }
  }
});

var state = {
  filters: [],
  status: 'loading',
  pages: pages
};

AppStore = {
  on: emitter.on,

  emitChange: function() {
    var clonedState = objectAssign({}, state);
    emitter.emit('change', clonedState);
  },

  state: function() {
    var clonedState = objectAssign({}, state);
    return clonedState;
  },

  dispatcherIndex: dispatcher.register(function(payload) {
    var action = payload.action;
    if(action === 'api-response') {
      var pageURL = payload.data.pageURL;
      state.pages.map(function(page) {
        if(page.url === pageURL) {
          page.report = payload.data.report;
        }
      });
    }
    AppStore.emitChange();
    return true;
  })
}

module.exports = AppStore;

},{"../dispatcher":6,"../libs/emitter":7,"object-assign":13}],10:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')

},{"./lib/Dispatcher":11}],11:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":12}],12:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],13:[function(require,module,exports){
'use strict';
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function ownEnumerableKeys(obj) {
	var keys = Object.getOwnPropertyNames(obj);

	if (Object.getOwnPropertySymbols) {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}

	return keys.filter(function (key) {
		return propIsEnumerable.call(obj, key);
	});
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = ownEnumerableKeys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],14:[function(require,module,exports){
/*! qwest 1.7.0 (https://github.com/pyrsmk/qwest) */

;(function(context,name,definition){
	if(typeof module!='undefined' && module.exports){
		module.exports=definition;
	}
	else if(typeof define=='function' && define.amd){
		define(definition);
	}
	else{
		context[name]=definition;
	}
}(this,'qwest',function(){

	var win=window,
		doc=document,
		before,
		// Default response type for XDR in auto mode
		defaultXdrResponseType='json',
		// Variables for limit mechanism
		limit=null,
		requests=0,
		request_stack=[],
		// Get XMLHttpRequest object
		getXHR=function(){
				return win.XMLHttpRequest?
						new XMLHttpRequest():
						new ActiveXObject('Microsoft.XMLHTTP');
			},
		// Guess XHR version
		xhr2=(getXHR().responseType===''),

	// Core function
	qwest=function(method,url,data,options,before){

		// Format
		method=method.toUpperCase();
		data=data || null;
		options=options || {};

		// Define variables
		var nativeResponseParsing=false,
			crossOrigin,
			xhr,
			xdr=false,
			timeoutInterval,
			aborted=false,
			attempts=0,
			headers={},
			mimeTypes={
				text: '*/*',
				xml: 'text/xml',
				json: 'application/json',
				post: 'application/x-www-form-urlencoded'
			},
			accept={
				text: '*/*',
				xml: 'application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1',
				json: 'application/json; q=1.0, text/*; q=0.8, */*; q=0.1'
			},
			contentType='Content-Type',
			vars='',
			i,j,
			serialized,
			then_stack=[],
			catch_stack=[],
			complete_stack=[],
			response,
			success,
			error,
			func,

		// Define promises
		promises={
			then:function(func){
				if(options.async){
					then_stack.push(func);
				}
				else if(success){
					func.call(xhr,response);
				}
				return promises;
			},
			'catch':function(func){
				if(options.async){
					catch_stack.push(func);
				}
				else if(error){
					func.call(xhr,response);
				}
				return promises;
			},
			complete:function(func){
				if(options.async){
					complete_stack.push(func);
				}
				else{
					func.call(xhr);
				}
				return promises;
			}
		},
		promises_limit={
			then:function(func){
				request_stack[request_stack.length-1].then.push(func);
				return promises_limit;
			},
			'catch':function(func){
				request_stack[request_stack.length-1]['catch'].push(func);
				return promises_limit;
			},
			complete:function(func){
				request_stack[request_stack.length-1].complete.push(func);
				return promises_limit;
			}
		},

		// Handle the response
		handleResponse=function(){
			// Verify request's state
			// --- https://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
			if(aborted){
				return;
			}
			// Prepare
			var i,req,p,responseType;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Launch next stacked request
			if(request_stack.length){
				req=request_stack.shift();
				p=qwest(req.method,req.url,req.data,req.options,req.before);
				for(i=0;func=req.then[i];++i){
					p.then(func);
				}
				for(i=0;func=req['catch'][i];++i){
					p['catch'](func);
				}
				for(i=0;func=req.complete[i];++i){
					p.complete(func);
				}
			}
			// Handle response
			try{
				// Init
				var responseText='responseText',
					responseXML='responseXML',
					parseError='parseError';
				// Process response
				if(nativeResponseParsing && 'response' in xhr && xhr.response!==null){
					response=xhr.response;
				}
				else if(options.responseType=='document'){
					var frame=doc.createElement('iframe');
					frame.style.display='none';
					doc.body.appendChild(frame);
					frame.contentDocument.open();
					frame.contentDocument.write(xhr.response);
					frame.contentDocument.close();
					response=frame.contentDocument;
					doc.body.removeChild(frame);
				}
				else{
					// Guess response type
					responseType=options.responseType;
					if(responseType=='auto'){
						if(xdr){
							responseType=defaultXdrResponseType;
						}
						else{
							var ct=xhr.getResponseHeader(contentType) || '';
							if(ct.indexOf(mimeTypes.json)>-1){
								responseType='json';
							}
							else if(ct.indexOf(mimeTypes.xml)>-1){
								responseType='xml';
							}
							else{
								responseType='text';
							}
						}
					}
					// Handle response type
					switch(responseType){
						case 'json':
							try{
								if('JSON' in win){
									response=JSON.parse(xhr[responseText]);
								}
								else{
									response=eval('('+xhr[responseText]+')');
								}
							}
							catch(e){
								throw "Error while parsing JSON body : "+e;
							}
							break;
						case 'xml':
							// Based on jQuery's parseXML() function
							try{
								// Standard
								if(win.DOMParser){
									response=(new DOMParser()).parseFromString(xhr[responseText],'text/xml');
								}
								// IE<9
								else{
									response=new ActiveXObject('Microsoft.XMLDOM');
									response.async='false';
									response.loadXML(xhr[responseText]);
								}
							}
							catch(e){
								response=undefined;
							}
							if(!response || !response.documentElement || response.getElementsByTagName('parsererror').length){
								throw 'Invalid XML';
							}
							break;
						default:
							response=xhr[responseText];
					}
				}
				// Late status code verification to allow data when, per example, a 409 is returned
				// --- https://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
				if('status' in xhr && !/^2|1223/.test(xhr.status)){
					throw xhr.status+' ('+xhr.statusText+')';
				}
				// Execute 'then' stack
				success=true;
				p=response;
				if(options.async){
					for(i=0;func=then_stack[i];++i){
						p=func.call(xhr, p);
					}
				}
			}
			catch(e){
				error=true;
				// Execute 'catch' stack
				if(options.async){
					for(i=0;func=catch_stack[i];++i){
						func.call(xhr, e, response);
					}
				}
			}
			// Execute complete stack
			if(options.async){
				for(i=0;func=complete_stack[i];++i){
					func.call(xhr, response);
				}
			}
		},

		// Handle errors
		handleError= function(e){
			error=true;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Execute 'catch' stack
			if(options.async){
				for(i=0;func=catch_stack[i];++i){
					func.call(xhr, e, null);
				}
			}
		},

		// Recursively build the query string
		buildData=function(data,key){
			var res=[],
				enc=encodeURIComponent,
				p;
			if(typeof data==='object' && data!=null) {
				for(p in data) {
					if(data.hasOwnProperty(p)) {
						var built=buildData(data[p],key?key+'['+p+']':p);
						if(built!==''){
							res=res.concat(built);
						}
					}
				}
			}
			else if(data!=null && key!=null){
				res.push(enc(key)+'='+enc(data));
			}
			return res.join('&');
		};

		// New request
		++requests;

		if ('retries' in options) {
			if (win.console && console.warn) {
				console.warn('[Qwest] The retries option is deprecated. It indicates total number of requests to attempt. Please use the "attempts" option.');
			}
			options.attempts = options.retries;
		}

		// Normalize options
		options.async='async' in options?!!options.async:true;
		options.cache='cache' in options?!!options.cache:(method!='GET');
		options.dataType='dataType' in options?options.dataType.toLowerCase():'post';
		options.responseType='responseType' in options?options.responseType.toLowerCase():'auto';
		options.user=options.user || '';
		options.password=options.password || '';
		options.withCredentials=!!options.withCredentials;
		options.timeout='timeout' in options?parseInt(options.timeout,10):30000;
		options.attempts='attempts' in options?parseInt(options.attempts,10):1;

		// Guess if we're dealing with a cross-origin request
		i=url.match(/\/\/(.+?)\//);
		crossOrigin=i && i[1]?i[1]!=location.host:false;

		// Prepare data
		if('ArrayBuffer' in win && data instanceof ArrayBuffer){
			options.dataType='arraybuffer';
		}
		else if('Blob' in win && data instanceof Blob){
			options.dataType='blob';
		}
		else if('Document' in win && data instanceof Document){
			options.dataType='document';
		}
		else if('FormData' in win && data instanceof FormData){
			options.dataType='formdata';
		}
		switch(options.dataType){
			case 'json':
				data=JSON.stringify(data);
				break;
			case 'post':
				data=buildData(data);
		}

		// Prepare headers
		if(options.headers){
			var format=function(match,p1,p2){
				return p1+p2.toUpperCase();
			};
			for(i in options.headers){
				headers[i.replace(/(^|-)([^-])/g,format)]=options.headers[i];
			}
		}
		if(!headers[contentType] && method!='GET'){
			if(options.dataType in mimeTypes){
				if(mimeTypes[options.dataType]){
					headers[contentType]=mimeTypes[options.dataType];
				}
			}
		}
		if(!headers.Accept){
			headers.Accept=(options.responseType in accept)?accept[options.responseType]:'*/*';
		}
		if(!crossOrigin && !headers['X-Requested-With']){ // because that header breaks in legacy browsers with CORS
			headers['X-Requested-With']='XMLHttpRequest';
		}

		// Prepare URL
		if(method=='GET' && data){
			vars+=data;
		}
		if(!options.cache){
			if(vars){
				vars+='&';
			}
			vars+='__t='+(+new Date());
		}
		if(vars){
			url+=(/\?/.test(url)?'&':'?')+vars;
		}

		// The limit has been reached, stock the request
		if(limit && requests==limit){
			request_stack.push({
				method	: method,
				url		: url,
				data	: data,
				options	: options,
				before	: before,
				then	: [],
				'catch'	: [],
				complete: []
			});
			return promises_limit;
		}

		// Send the request
		var send=function(){
			// Get XHR object
			xhr=getXHR();
			if(crossOrigin){
				if(!('withCredentials' in xhr) && win.XDomainRequest){
					xhr=new XDomainRequest(); // CORS with IE8/9
					xdr=true;
					if(method!='GET' && method!='POST'){
						method='POST';
					}
				}
			}
			// Open connection
			if(xdr){
				xhr.open(method,url);
			}
			else{
				xhr.open(method,url,options.async,options.user,options.password);
				if(xhr2 && options.async){
					xhr.withCredentials=options.withCredentials;
				}
			}
			// Set headers
			if(!xdr){
				for(var i in headers){
					xhr.setRequestHeader(i,headers[i]);
				}
			}
			// Verify if the response type is supported by the current browser
			if(xhr2 && options.responseType!='document' && options.responseType!='auto'){ // Don't verify for 'document' since we're using an internal routine
				try{
					xhr.responseType=options.responseType;
					nativeResponseParsing=(xhr.responseType==options.responseType);
				}
				catch(e){}
			}
			// Plug response handler
			if(xhr2 || xdr){
				xhr.onload=handleResponse;
				xhr.onerror=handleError;
			}
			else{
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						handleResponse();
					}
				};
			}
			// Override mime type to ensure the response is well parsed
			if(options.responseType!='auto' && 'overrideMimeType' in xhr){
				xhr.overrideMimeType(mimeTypes[options.responseType]);
			}
			// Run 'before' callback
			if(before){
				before.call(xhr);
			}
			// Send request
			if(xdr){
				setTimeout(function(){ // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
					xhr.send(method!='GET'?data:null);
				},0);
			}
			else{
				xhr.send(method!='GET'?data:null);
			}
		};

		// Timeout/attempts
		var timeout=function(){
			timeoutInterval=setTimeout(function(){
				aborted=true;
				xhr.abort();
				if(!options.attempts || ++attempts!=options.attempts){
					aborted=false;
					timeout();
					send();
				}
				else{
					aborted=false;
					error=true;
					response='Timeout ('+url+')';
					if(options.async){
						for(i=0;func=catch_stack[i];++i){
							func.call(xhr,response);
						}
					}
				}
			},options.timeout);
		};

		// Start the request
		timeout();
		send();

		// Return promises
		return promises;

	};

	// Return external qwest object
	var create=function(method){
			return function(url,data,options){
				var b=before;
				before=null;
				return qwest(method,this.base+url,data,options,b);
			};
		},
		obj={
            base: '',
			before: function(callback){
				before=callback;
				return obj;
			},
			get: create('GET'),
			post: create('POST'),
			put: create('PUT'),
			'delete': create('DELETE'),
			xhr2: xhr2,
			limit: function(by){
				limit=by;
			},
			setDefaultXdrResponseType: function(type){
				defaultXdrResponseType=type.toLowerCase();
			}
		};
	return obj;

}()));

},{}]},{},[3]);
