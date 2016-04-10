(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var React = require('react');

var Application = require('../src/views/Application.react');

React.render(React.createElement(Application, null), document.getElementById('entrypoint'));

},{"../src/views/Application.react":20,"react":"react"}],2:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":6}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":4,"inherits":3}],7:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes += ' ' + arg;
			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],8:[function(require,module,exports){
/**
 * @preserve jquery-param (c) 2015 KNOWLEDGECODE | MIT
 */
/*global define */
(function (global) {
    'use strict';

    var param = function (a) {
        var add = function (s, k, v) {
            v = typeof v === 'function' ? v() : v === null ? '' : v === undefined ? '' : v;
            s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }, buildParams = function (prefix, obj, s) {
            var i, len, key;

            if (Object.prototype.toString.call(obj) === '[object Array]') {
                for (i = 0, len = obj.length; i < len; i++) {
                    buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i], s);
                }
            } else if (obj && obj.toString() === '[object Object]') {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (prefix) {
                            buildParams(prefix + '[' + key + ']', obj[key], s, add);
                        } else {
                            buildParams(key, obj[key], s, add);
                        }
                    }
                }
            } else if (prefix) {
                add(s, prefix, obj);
            } else {
                for (key in obj) {
                    add(s, key, obj[key]);
                }
            }
            return s;
        };
        return buildParams('', a, []).join('&').replace(/%20/g, '+');
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = param;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return param;
        });
    } else {
        global.param = param;
    }

}(this));

},{}],9:[function(require,module,exports){
(function (process){
/*
 * PinkySwear.js 2.2.2 - Minimalistic implementation of the Promises/A+ spec
 * 
 * Public Domain. Use, modify and distribute it any way you like. No attribution required.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * PinkySwear is a very small implementation of the Promises/A+ specification. After compilation with the
 * Google Closure Compiler and gzipping it weighs less than 500 bytes. It is based on the implementation for 
 * Minified.js and should be perfect for embedding. 
 *
 *
 * PinkySwear has just three functions.
 *
 * To create a new promise in pending state, call pinkySwear():
 *         var promise = pinkySwear();
 *
 * The returned object has a Promises/A+ compatible then() implementation:
 *          promise.then(function(value) { alert("Success!"); }, function(value) { alert("Failure!"); });
 *
 *
 * The promise returned by pinkySwear() is a function. To fulfill the promise, call the function with true as first argument and
 * an optional array of values to pass to the then() handler. By putting more than one value in the array, you can pass more than one
 * value to the then() handlers. Here an example to fulfill a promsise, this time with only one argument: 
 *         promise(true, [42]);
 *
 * When the promise has been rejected, call it with false. Again, there may be more than one argument for the then() handler:
 *         promise(true, [6, 6, 6]);
 *         
 * You can obtain the promise's current state by calling the function without arguments. It will be true if fulfilled,
 * false if rejected, and otherwise undefined.
 * 		   var state = promise(); 
 * 
 * https://github.com/timjansen/PinkySwear.js
 */
(function(target) {
	var undef;

	function isFunction(f) {
		return typeof f == 'function';
	}
	function isObject(f) {
		return typeof f == 'object';
	}
	function defer(callback) {
		if (typeof setImmediate != 'undefined')
			setImmediate(callback);
		else if (typeof process != 'undefined' && process['nextTick'])
			process['nextTick'](callback);
		else
			setTimeout(callback, 0);
	}

	target[0][target[1]] = function pinkySwear(extend) {
		var state;           // undefined/null = pending, true = fulfilled, false = rejected
		var values = [];     // an array of values as arguments for the then() handlers
		var deferred = [];   // functions to call when set() is invoked

		var set = function(newState, newValues) {
			if (state == null && newState != null) {
				state = newState;
				values = newValues;
				if (deferred.length)
					defer(function() {
						for (var i = 0; i < deferred.length; i++)
							deferred[i]();
					});
			}
			return state;
		};

		set['then'] = function (onFulfilled, onRejected) {
			var promise2 = pinkySwear(extend);
			var callCallbacks = function() {
	    		try {
	    			var f = (state ? onFulfilled : onRejected);
	    			if (isFunction(f)) {
		   				function resolve(x) {
						    var then, cbCalled = 0;
		   					try {
				   				if (x && (isObject(x) || isFunction(x)) && isFunction(then = x['then'])) {
										if (x === promise2)
											throw new TypeError();
										then['call'](x,
											function() { if (!cbCalled++) resolve.apply(undef,arguments); } ,
											function(value){ if (!cbCalled++) promise2(false,[value]);});
				   				}
				   				else
				   					promise2(true, arguments);
		   					}
		   					catch(e) {
		   						if (!cbCalled++)
		   							promise2(false, [e]);
		   					}
		   				}
		   				resolve(f.apply(undef, values || []));
		   			}
		   			else
		   				promise2(state, values);
				}
				catch (e) {
					promise2(false, [e]);
				}
			};
			if (state != null)
				defer(callCallbacks);
			else
				deferred.push(callCallbacks);
			return promise2;
		};
        if(extend){
            set = extend(set);
        }
		return set;
	};
})(typeof module == 'undefined' ? [window, 'pinkySwear'] : [module, 'exports']);


}).call(this,require('_process'))
},{"_process":4}],10:[function(require,module,exports){
/*! qwest 2.2.4 (https://github.com/pyrsmk/qwest) */

module.exports = function() {

	var global = window || this,
		pinkyswear = require('pinkyswear'),
		jparam = require('jquery-param'),
		// Default response type for XDR in auto mode
		defaultXdrResponseType = 'json',
		// Default data type
		defaultDataType = 'post',
		// Variables for limit mechanism
		limit = null,
		requests = 0,
		request_stack = [],
		// Get XMLHttpRequest object
		getXHR = function(){
			return global.XMLHttpRequest?
					new global.XMLHttpRequest():
					new ActiveXObject('Microsoft.XMLHTTP');
		},
		// Guess XHR version
		xhr2 = (getXHR().responseType===''),

	// Core function
	qwest = function(method, url, data, options, before) {

		// Format
		method = method.toUpperCase();
		data = data || null;
		options = options || {};

		// Define variables
		var nativeResponseParsing = false,
			crossOrigin,
			xhr,
			xdr = false,
			timeoutInterval,
			aborted = false,
			attempts = 0,
			headers = {},
			mimeTypes = {
				text: '*/*',
				xml: 'text/xml',
				json: 'application/json',
				post: 'application/x-www-form-urlencoded'
			},
			accept = {
				text: '*/*',
				xml: 'application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1',
				json: 'application/json; q=1.0, text/*; q=0.8, */*; q=0.1'
			},
			vars = '',
			i, j,
			serialized,
			response,
			sending = false,
			delayed = false,
			timeout_start,

		// Create the promise
		promise = pinkyswear(function(pinky) {
			pinky['catch'] = function(f) {
				return pinky.then(null, f);
			};
			pinky.complete = function(f) {
				return pinky.then(f, f);
			};
			// Override
			if('pinkyswear' in options) {
				for(i in options.pinkyswear) {
					pinky[i] = options.pinkyswear[i];
				}
			}
			pinky.send = function() {
				// Prevent further send() calls
				if(sending) {
					return;
				}
				// Reached request limit, get out!
				if(requests == limit) {
					request_stack.push(pinky);
					return;
				}
				++requests;
				sending = true;
				// Start the chrono
				timeout_start = new Date().getTime();
				// Get XHR object
				xhr = getXHR();
				if(crossOrigin) {
					if(!('withCredentials' in xhr) && global.XDomainRequest) {
						xhr = new XDomainRequest(); // CORS with IE8/9
						xdr = true;
						if(method!='GET' && method!='POST') {
							method = 'POST';
						}
					}
				}
				// Open connection
				if(xdr) {
					xhr.open(method, url);
				}
				else {
					xhr.open(method, url, options.async, options.user, options.password);
					if(xhr2 && options.async) {
						xhr.withCredentials = options.withCredentials;
					}
				}
				// Set headers
				if(!xdr) {
					for(var i in headers) {
						if(headers[i]) {
							xhr.setRequestHeader(i, headers[i]);
						}
					}
				}
				// Verify if the response type is supported by the current browser
				if(xhr2 && options.responseType!='document' && options.responseType!='auto') { // Don't verify for 'document' since we're using an internal routine
					try {
						xhr.responseType = options.responseType;
						nativeResponseParsing = (xhr.responseType==options.responseType);
					}
					catch(e){}
				}
				// Plug response handler
				if(xhr2 || xdr) {
					xhr.onload = handleResponse;
					xhr.onerror = handleError;
				}
				else {
					xhr.onreadystatechange = function() {
						if(xhr.readyState == 4) {
							handleResponse();
						}
					};
				}
				// Override mime type to ensure the response is well parsed
				if(options.responseType!='auto' && 'overrideMimeType' in xhr) {
					xhr.overrideMimeType(mimeTypes[options.responseType]);
				}
				// Run 'before' callback
				if(before) {
					before(xhr);
				}
				// Send request
				if(xdr) {
					setTimeout(function(){ // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
						xhr.send(method!='GET'?data:null);
					},0);
				}
				else {
					xhr.send(method!='GET'?data:null);
				}
			};
			return pinky;
		}),

		// Handle the response
		handleResponse = function() {
			// Prepare
			var i, responseType;
			--requests;
			sending = false;
			// Verify timeout state
			// --- https://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
			if(new Date().getTime()-timeout_start >= options.timeout) {
				if(!options.attempts || ++attempts!=options.attempts) {
					promise.send();
				}
				else {
					promise(false, [xhr,response,new Error('Timeout ('+url+')')]);
				}
				return;
			}
			// Launch next stacked request
			if(request_stack.length) {
				request_stack.shift().send();
			}
			// Handle response
			try{
				// Process response
				if(nativeResponseParsing && 'response' in xhr && xhr.response!==null) {
					response = xhr.response;
				}
				else if(options.responseType == 'document') {
					var frame = document.createElement('iframe');
					frame.style.display = 'none';
					document.body.appendChild(frame);
					frame.contentDocument.open();
					frame.contentDocument.write(xhr.response);
					frame.contentDocument.close();
					response = frame.contentDocument;
					document.body.removeChild(frame);
				}
				else{
					// Guess response type
					responseType = options.responseType;
					if(responseType == 'auto') {
						if(xdr) {
							responseType = defaultXdrResponseType;
						}
						else {
							var ct = xhr.getResponseHeader('Content-Type') || '';
							if(ct.indexOf(mimeTypes.json)>-1) {
								responseType = 'json';
							}
							else if(ct.indexOf(mimeTypes.xml)>-1) {
								responseType = 'xml';
							}
							else {
								responseType = 'text';
							}
						}
					}
					// Handle response type
					switch(responseType) {
						case 'json':
							try {
								if('JSON' in global) {
									response = JSON.parse(xhr.responseText);
								}
								else {
									response = eval('('+xhr.responseText+')');
								}
							}
							catch(e) {
								throw "Error while parsing JSON body : "+e;
							}
							break;
						case 'xml':
							// Based on jQuery's parseXML() function
							try {
								// Standard
								if(global.DOMParser) {
									response = (new DOMParser()).parseFromString(xhr.responseText,'text/xml');
								}
								// IE<9
								else {
									response = new ActiveXObject('Microsoft.XMLDOM');
									response.async = 'false';
									response.loadXML(xhr.responseText);
								}
							}
							catch(e) {
								response = undefined;
							}
							if(!response || !response.documentElement || response.getElementsByTagName('parsererror').length) {
								throw 'Invalid XML';
							}
							break;
						default:
							response = xhr.responseText;
					}
				}
				// Late status code verification to allow passing data when, per example, a 409 is returned
				// --- https://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
				if('status' in xhr && !/^2|1223/.test(xhr.status)) {
					throw xhr.status+' ('+xhr.statusText+')';
				}
				// Fulfilled
				promise(true, [xhr,response]);
			}
			catch(e) {
				// Rejected
				promise(false, [xhr,response,e]);
			}
		},

		// Handle errors
		handleError = function(e) {
			--requests;
			promise(false, [xhr,null,new Error('Connection aborted')]);
		};

		// Normalize options
		options.async = 'async' in options?!!options.async:true;
		options.cache = 'cache' in options?!!options.cache:false;
		options.dataType = 'dataType' in options?options.dataType.toLowerCase():defaultDataType;
		options.responseType = 'responseType' in options?options.responseType.toLowerCase():'auto';
		options.user = options.user || '';
		options.password = options.password || '';
		options.withCredentials = !!options.withCredentials;
		options.timeout = 'timeout' in options?parseInt(options.timeout,10):30000;
		options.attempts = 'attempts' in options?parseInt(options.attempts,10):1;

		// Guess if we're dealing with a cross-origin request
		i = url.match(/\/\/(.+?)\//);
		crossOrigin = i && (i[1]?i[1]!=location.host:false);

		// Prepare data
		if('ArrayBuffer' in global && data instanceof ArrayBuffer) {
			options.dataType = 'arraybuffer';
		}
		else if('Blob' in global && data instanceof Blob) {
			options.dataType = 'blob';
		}
		else if('Document' in global && data instanceof Document) {
			options.dataType = 'document';
		}
		else if('FormData' in global && data instanceof FormData) {
			options.dataType = 'formdata';
		}
		switch(options.dataType) {
			case 'json':
				data = JSON.stringify(data);
				break;
			case 'post':
				data = jparam(data);
		}

		// Prepare headers
		if(options.headers) {
			var format = function(match,p1,p2) {
				return p1 + p2.toUpperCase();
			};
			for(i in options.headers) {
				headers[i.replace(/(^|-)([^-])/g,format)] = options.headers[i];
			}
		}
		if(!('Content-Type' in headers) && method!='GET') {
			if(options.dataType in mimeTypes) {
				if(mimeTypes[options.dataType]) {
					headers['Content-Type'] = mimeTypes[options.dataType];
				}
			}
		}
		if(!headers.Accept) {
			headers.Accept = (options.responseType in accept)?accept[options.responseType]:'*/*';
		}
		if(!crossOrigin && !('X-Requested-With' in headers)) { // (that header breaks in legacy browsers with CORS)
			headers['X-Requested-With'] = 'XMLHttpRequest';
		}
		if(!options.cache && !('Cache-Control' in headers)) {
			headers['Cache-Control'] = 'no-cache';
		}

		// Prepare URL
		if(method=='GET' && data) {
			vars += data;
		}
		if(vars) {
			url += (/\?/.test(url)?'&':'?')+vars;
		}

		// Start the request
		if(options.async) {
			promise.send();
		}

		// Return promise
		return promise;

	};

	// Return the external qwest object
	return {
		base: '',
		get: function(url, data, options, before) {
			return qwest('GET', this.base+url, data, options, before);
		},
		post: function(url, data, options, before) {
			return qwest('POST', this.base+url, data, options, before);
		},
		put: function(url, data, options, before) {
			return qwest('PUT', this.base+url, data, options, before);
		},
		'delete': function(url, data, options, before) {
			return qwest('DELETE', this.base+url, data, options, before);
		},
		map: function(type, url, data, options, before) {
			return qwest(type.toUpperCase(), this.base+url, data, options, before);
		},
		xhr2: xhr2,
		limit: function(by) {
			limit = by;
		},
		setDefaultXdrResponseType: function(type) {
			defaultXdrResponseType = type.toLowerCase();
		},
		setDefaultDataType: function(type) {
			defaultDataType = type.toLowerCase();
		}
	};

}();

},{"jquery-param":8,"pinkyswear":9}],11:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Dispatcher = require("flux").Dispatcher;
var _dispatcher = new Dispatcher();
var _dispatch = _dispatcher.dispatch;
_dispatcher.dispatch = function(command) {
    console.log(command);
    _dispatch.apply(_dispatcher, arguments);
};

var ApiWebClient = require("../webclients/ApiWebClient");
var Validation = require("../utils/Validation");

var Convention = require("./Convention");

function Command(name) {
    Validation.IsTypeOf(name, 'string');

    var query = { name: name, args: _.rest(arguments) };
    _dispatcher.dispatch(query);

    var method = ApiWebClient[name];
    if(!_.isFunction(method)) return;

    method.apply(ApiWebClient, query.args)
        .then(function(xhr, response) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Success(name), response: response }));
        })
        .catch(function(xhr, response, error) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Fails(name), response: response, error: error }));
        });
}

Command.register = function() {
    return _dispatcher.register.apply(_dispatcher, arguments);
};

Command.waitFor = function() {
    return _dispatcher.waitFor.apply(_dispatcher, arguments);
}

module.exports = Command;

},{"../utils/Validation":19,"../webclients/ApiWebClient":24,"./Convention":13,"flux":"flux","lodash":"lodash"}],12:[function(require,module,exports){
"use strict";

var _ = require("lodash");
var classnames = require("classnames");

var React = require("react");

var Store = require("./Store");

var RouteStore = require("../stores/RouteStore");

var Validation = require("../utils/Validation");

var _empty = _.partial(_.identity, undefined);

function Component(component, stores) {
    Validation.IsTypeOf(component, "object");
    var _component = component;

    Validation.IsArrayOfInstances(stores, Store);
    var _stores = stores;

    this.route = _.bind(RouteStore.get, RouteStore, "route");
    this.css = classnames;

    this._base = function(method, params) {
        return _.get(_component, method, _empty).apply(this, params);
    };

    if (!_.isEmpty(_stores)) {
        _stores = _.union(_stores, [RouteStore]);

        this.getInitialState = function() {
            return this._base("getInitialState") || this.getState();
        };

        this.componentDidMount = function() {
            this._base("componentDidMount");

            _.invoke(_stores, "on", this._onChange);

            this.componentDidUpdate();
        };

        this.componentWillUnmount = function() {
            this._base("componentWillUnmount");

            _.invoke(_stores, "off", this._onChange);
        };

        this.componentDidUpdate = function() {
            this._base("componentDidUpdate", _.toArray(arguments));
        };

        this.getState = function() {
            return this._base("getState", _.toArray(arguments));
        };

        this._onChange = function() {
            if(this.isMounted()) {
                this._base("_onChange");
                this.setState(this.getState());
            }
        };
    } else {
        this.shouldComponentUpdate = function(nextProp, nextState) {
            var result = this._base("shouldComponentUpdate", _.toArray(arguments));
            if (_.isBoolean(result)) return result;

            return !_.isEqual(nextProp, this.props) || !_.isEqual(nextState, this.state);
        };
    }

    //add if not exists;
    _.defaults(this, _component);
}

Component.Create = function() {
    var component = _.last(arguments),
        stores = _.initial(arguments);

    return React.createClass(new Component(component, stores));
}

module.exports = Component;

},{"../stores/RouteStore":18,"../utils/Validation":19,"./Store":15,"classnames":7,"lodash":"lodash","react":"react"}],13:[function(require,module,exports){
"use strict";

var Validation = require("../utils/Validation");

var Convention = {
    Fails: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Fails";
    },
    Success: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Success";
    }
}

module.exports = Convention;

},{"../utils/Validation":19}],14:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Dispatcher = require("flux").Dispatcher;
var _dispatcher = new Dispatcher();
var _dispatch = _dispatcher.dispatch;
_dispatcher.dispatch = function(command) {
    console.log(command);
    return _dispatch.apply(_dispatcher, arguments);
};

var ViewWebClient = require("../webclients/ViewWebClient");
var Validation = require("../utils/Validation");

var Convention = require("./Convention");

var _inprogress = {};
function Query(name) {
    Validation.IsTypeOf(name, 'string');
    var method = ViewWebClient[name];
    if(!_.isFunction(method)) return;

    var query = { name: name, args: _.rest(arguments) };
    var key = JSON.stringify(query);
    if(_.has(_inprogress, key)) return;
    _inprogress[key] = null;

    _dispatcher.dispatch(query);
    method.apply(ViewWebClient, query.args)
        .then(function(xhr, response) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Success(name), response: response }));
        })
        .catch(function(xhr, response, error) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Fails(name), response: response, error: error }));
        })
        .complete(function(xhr, response) {
            delete _inprogress[key];
        });
}

Query.register = function() {
    return _dispatcher.register.apply(_dispatcher, arguments);
};

module.exports = Query;

},{"../utils/Validation":19,"../webclients/ViewWebClient":25,"./Convention":13,"flux":"flux","lodash":"lodash"}],15:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var EventEmitter = require("events").EventEmitter;

var Validation = require("../utils/Validation");

var CHANGE_EVENT = "change";

function Store(options) {
    if(_.has(options, 'getHandlers')) {
        Validation.IsTypeOf(options, 'function', ['getHandlers']);
    } else {
        Validation.IsTypeOf(options, 'function', ['globalHandler']);
    }
    _.extend(this, options);

    EventEmitter.call(this);
    this.setMaxListeners(100);

    var _state;

    var _emit = this.emit;
    this.emit = function() {
        _emit(CHANGE_EVENT);
    };

    var _on = this.on;
    this.on = function(callback) {
        _on(CHANGE_EVENT, callback);
    };

    this.off = function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    };

    this.get = function() {
        var path = _.toArray(arguments);
        return _.cloneDeep(path.length ? _.get(_state, path) : _state);
    };

    this.set = function(state) {
        var path = _.initial(arguments);
        var value = _.last(arguments);

        if (_.any(path)) {
            _state = _state || {};
            _.set(_state, path, value);
        } else {
            _state = value;
        }
    }

    this.has = function() {
        var path = _.toArray(arguments);
        return !_.isUndefined(path.length ? _.get(_state, path) : _state);
    };
}

Store.prototype = _.create(EventEmitter.prototype, {
    "constructor": Store
});

module.exports = Store;

},{"../utils/Validation":19,"events":"events","lodash":"lodash"}],16:[function(require,module,exports){
'use strict';

var _ = require('lodash');

var Store = require('./Store');
var Command = require('./Command');
var Query = require('./Query');

function StoreFactory() {
    var _register = function(dispatcher, store) {
        var handlers = store.getHandlers.call(store);

        return dispatcher.register(function(action) {
            if (_.isUndefined(action.name)) throw "invalid action was performed";

            var handler = handlers[action.name] || store.globalHandler;
            if (_.isFunction(handler)) {
                handler.call(store, action);
                store.emit();
            }
        });
    };

    this.Create = function(storeObject) {
        var store = new Store(storeObject);

        store.commandToken = _register(Command, store);
        store.queryToken = _register(Query, store);

        return store;
    }
}

module.exports = new StoreFactory();

},{"./Command":11,"./Query":14,"./Store":15,"lodash":"lodash"}],17:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Symbols = [
    "CreateUser",

    "UserExists",
    "GetUserToken"
];

module.exports = _.mapKeys(Symbols, _.indentity);

},{"lodash":"lodash"}],18:[function(require,module,exports){
'use strict';

var StoreFactory = require('../core/StoreFactory');
var Symbols = require('../core/Symbols');

var RouteStore = StoreFactory.Create({
    getHandlers: function () {
        var _set = function(command) {
            this.set('route', command.route);
        };

        var handlers = {};
        handlers[Symbols.ChangeRoute] = _set;

        return handlers;
    }
});

module.exports = RouteStore;

},{"../core/StoreFactory":16,"../core/Symbols":17}],19:[function(require,module,exports){
"use strict";

var _ = require("lodash");
var assert = require("assert");

function _exists(object, property) {
    if (!_.has(object, property)) {
        assert.fail(object, property, "Validation: '" + property + "' is not exists", "has no key")
    }
}

function _getProperty(object, property) {
    if (_.isUndefined(property)) return object;

    _exists(object, property);
    return object[property];
}

function _inRange(value, range) {
    _exists(range, value);
}

function _isMatch(value, pattern) {
    var regexp = new RegExp(pattern);

    if(!regexp.test(value)) {
        assert.fail(value, pattern, "Validation: object or its property is not match", "has no matche")
    }
}

function _isVersion(value) {
    _isMatch(value, "^[0-9]+\.[0-9]+\.[0-9]+$");
}

function _isInstanceOf(value, type) {
    if(!(value instanceof type)) {
        throw "Validation: value is not an instance of expected type";
    }
}

function _isTypeOf(value, typeName) {
    if(_.isNaN(value) || typeof value !== typeName) {
        throw "Validation: value has wrong expected type";
    }
}

function _isTypeOfOrEmpty(value, typeName) {
    if(_.isEmpty(value)) return;

    _isTypeOf(value, typeName);
}

function _isArrayOfInstances(value, type) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isInstanceOf)(_, type));
}

function _isArrayOfType(value, typeName) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isTypeOf)(_, typeName));
}

function _isFunction(value) {
    if(!_.isFunction(value)) {
        throw "Validation: value is required to be a function";
    }
}

function _isNull(value) {
    if(!_.isNull(value)) {
        throw "Validation: value is required to be a null";
    }
}

function _create(validator) {
    return function() {
        var properties = _.last(arguments);

        if(_.isArray(properties)) {
            var target = _.first(arguments);
            var params = _.rest(_.initial(arguments));
            _.each(properties, function(property) {
                var value = _getProperty(target, property);

                validator.apply(validator, [value].concat(params));
            });
        } else {
            validator.apply(validator, arguments);
        }
    };
}

module.exports = {
    InRange: _create(_inRange),
    IsVersion: _create(_isVersion),
    IsMatch: _create(_isMatch),
    IsInstanceOf: _create(_isInstanceOf),
    IsFunction: _create(_isFunction),
    IsTypeOf: _create(_isTypeOf),
    IsTypeOfOrEmpty: _create(_isTypeOfOrEmpty),
    IsArrayOfInstances: _create(_isArrayOfInstances),
    IsArrayOfType: _create(_isArrayOfType),
    IsNull: _create(_isNull)
};

},{"assert":2,"lodash":"lodash"}],20:[function(require,module,exports){
"use strict";

// var _ = require("lodash");
var React = require("react");

// var Command = require("../core/Command");
// var Symbols = require("../core/Symbols");
// var Query = require("../core/Query");
var Component = require("../core/Component");

var Header = require("./header/Header.react");

var Application = Component.Create({
    getState: function() {
        return {};
    },

    render: function() {
        return (React.createElement("div", {className: "main"}, 
            React.createElement(Header, null), 
            React.createElement("div", {className: "view"}
            )
        ));
    }
});

module.exports = Application;

},{"../core/Component":12,"./header/Header.react":21,"react":"react"}],21:[function(require,module,exports){
"use strict";

// var _ = require("lodash");
var React = require("react");

var Component = require("../../core/Component");

var Navigation = require("./Navigation.react");
var Socials = require("./Socials.react");

var Header = Component.Create({
    render: function() {
        return (React.createElement("header", {className: "header"}, 
            React.createElement(Navigation, null), 
            React.createElement("a", {className: "logo", href: "/"}, "Mex"), 
            React.createElement(Socials, null)
        ));
    }
});

module.exports = Header;

},{"../../core/Component":12,"./Navigation.react":22,"./Socials.react":23,"react":"react"}],22:[function(require,module,exports){
"use strict";

// var _ = require("lodash");
var React = require("react");

var Component = require("../../core/Component");

var Navigation = Component.Create({
    render: function() {
        return (React.createElement("div", {className: "navigation"}, 
            "navigation"
        ));
    }
});

module.exports = Navigation;

},{"../../core/Component":12,"react":"react"}],23:[function(require,module,exports){
"use strict";

var React = require("react");

var Component = require("../../core/Component");

var Socials = Component.Create({
    render: function() {
        return (React.createElement("div", {className: "socials"}, 
            React.createElement("a", {className: "facebook", href: "https://www.facebook.com/misha.dev"}, "facebook"), 
            React.createElement("a", {className: "twitter", href: "https://twitter.com/MishaDev"}, "twitter"), 
            React.createElement("a", {className: "instagram", href: "https://www.instagram.com/misho_nak/"}, "instagram"), 
            React.createElement("a", {className: "youtube", href: "https://www.youtube.com/user/misha4dev"}, "youtube")
        ));
    }
});

module.exports = Socials;

},{"../../core/Component":12,"react":"react"}],24:[function(require,module,exports){
"use strict";

var qwest = require('qwest');
qwest.setDefaultDataType('json');

var host = "http://localhost:3000";

var ApiWebClient = {
    CreateUser: function(username, password) {
        return qwest.post(host + '/api/users/create', {
            username: username,
            password: password
        });
    }
};

module.exports = ApiWebClient;

},{"qwest":10}],25:[function(require,module,exports){
"use strict";

var _ = require("lodash");
var qwest = require("qwest");

var host = "http://localhost:3000";

var ViewWebClient = {
    UserExists: function(username) {
        return qwest.get(
            _.template(host + "/api/user/exists/${username}/")({username: username})
        );
    },
    GetUserToken: function(username, password) {
        return qwest.get(
            _.template(host + "/api/user/token/?un=${username}&pw=${password}")({username: username, password: password})
        );
    }
};

module.exports = ViewWebClient;

},{"lodash":"lodash","qwest":10}]},{},[1]);
