/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/electron-squirrel-startup/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/index.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var path = __webpack_require__(/*! path */ "path");
var spawn = (__webpack_require__(/*! child_process */ "child_process").spawn);
var debug = __webpack_require__(/*! debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js")('electron-squirrel-startup');
var app = (__webpack_require__(/*! electron */ "electron").app);
var run = function (args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};
var check = function () {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);
    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};
module.exports = check();

/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js ***!
  \**********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();

/**
 * Colors.
 */

exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) ||
  // is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 ||
  // double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;
  args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);
  if (!useColors) return;
  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch (e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch (e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js ***!
  \********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0,
    i;
  for (i in namespace) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {
  function debug() {
    // disabled?
    if (!debug.enabled) return;
    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    args[0] = exports.coerce(args[0]);
    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);
    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }
  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);
  exports.names = [];
  exports.skips = [];
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;
  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js");
}

/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js ***!
  \*******************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;else if (/^(no|off|false|disabled)$/i.test(val)) val = false;else if (val === 'null') val = null;else val = Number(val);
  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
if (1 !== fd && 2 !== fd) {
  util.deprecate(function () {}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
}
var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts).split('\n').map(function (str) {
    return str.trim();
  }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;
  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';
    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString() + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream(fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;
    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, {
        autoClose: false
      });
      stream._type = 'fs';
      break;
    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;
    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;
  stream._isStdio = true;
  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
  debug.inspectOpts = {};
  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());

/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/ms/index.js ***!
  \*************************************************************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

/***/ }),

/***/ "./node_modules/node-gyp-build/index.js":
/*!**********************************************!*\
  !*** ./node_modules/node-gyp-build/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const runtimeRequire =  true ? eval("require") : 0; // eslint-disable-line
if (typeof runtimeRequire.addon === 'function') {
  // if the platform supports native resolving prefer that
  module.exports = runtimeRequire.addon.bind(runtimeRequire);
} else {
  // else use the runtime version here
  module.exports = __webpack_require__(/*! ./node-gyp-build.js */ "./node_modules/node-gyp-build/node-gyp-build.js");
}

/***/ }),

/***/ "./node_modules/node-gyp-build/node-gyp-build.js":
/*!*******************************************************!*\
  !*** ./node_modules/node-gyp-build/node-gyp-build.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fs = __webpack_require__(/*! fs */ "fs");
var path = __webpack_require__(/*! path */ "path");
var os = __webpack_require__(/*! os */ "os");

// Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'
var runtimeRequire =  true ? eval("require") : 0; // eslint-disable-line

var vars = process.config && process.config.variables || {};
var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
var abi = process.versions.modules; // TODO: support old node where this is undef
var runtime = isElectron() ? 'electron' : isNwjs() ? 'node-webkit' : 'node';
var arch = process.env.npm_config_arch || os.arch();
var platform = process.env.npm_config_platform || os.platform();
var libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc');
var armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || '';
var uv = (process.versions.uv || '').split('.')[0];
module.exports = load;
function load(dir) {
  return runtimeRequire(load.resolve(dir));
}
load.resolve = load.path = function (dir) {
  dir = path.resolve(dir || '.');
  try {
    var name = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_');
    if (process.env[name + '_PREBUILD']) dir = process.env[name + '_PREBUILD'];
  } catch (err) {}
  if (!prebuildsOnly) {
    var release = getFirst(path.join(dir, 'build/Release'), matchBuild);
    if (release) return release;
    var debug = getFirst(path.join(dir, 'build/Debug'), matchBuild);
    if (debug) return debug;
  }
  var prebuild = resolve(dir);
  if (prebuild) return prebuild;
  var nearby = resolve(path.dirname(process.execPath));
  if (nearby) return nearby;
  var target = ['platform=' + platform, 'arch=' + arch, 'runtime=' + runtime, 'abi=' + abi, 'uv=' + uv, armv ? 'armv=' + armv : '', 'libc=' + libc, 'node=' + process.versions.node, process.versions.electron ? 'electron=' + process.versions.electron : '',  true ? 'webpack=true' : 0 // eslint-disable-line
  ].filter(Boolean).join(' ');
  throw new Error('No native build was found for ' + target + '\n    loaded from: ' + dir + '\n');
  function resolve(dir) {
    // Find matching "prebuilds/<platform>-<arch>" directory
    var tuples = readdirSync(path.join(dir, 'prebuilds')).map(parseTuple);
    var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
    if (!tuple) return;

    // Find most specific flavor first
    var prebuilds = path.join(dir, 'prebuilds', tuple.name);
    var parsed = readdirSync(prebuilds).map(parseTags);
    var candidates = parsed.filter(matchTags(runtime, abi));
    var winner = candidates.sort(compareTags(runtime))[0];
    if (winner) return path.join(prebuilds, winner.file);
  }
};
function readdirSync(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    return [];
  }
}
function getFirst(dir, filter) {
  var files = readdirSync(dir).filter(filter);
  return files[0] && path.join(dir, files[0]);
}
function matchBuild(name) {
  return /\.node$/.test(name);
}
function parseTuple(name) {
  // Example: darwin-x64+arm64
  var arr = name.split('-');
  if (arr.length !== 2) return;
  var platform = arr[0];
  var architectures = arr[1].split('+');
  if (!platform) return;
  if (!architectures.length) return;
  if (!architectures.every(Boolean)) return;
  return {
    name,
    platform,
    architectures
  };
}
function matchTuple(platform, arch) {
  return function (tuple) {
    if (tuple == null) return false;
    if (tuple.platform !== platform) return false;
    return tuple.architectures.includes(arch);
  };
}
function compareTuples(a, b) {
  // Prefer single-arch prebuilds over multi-arch
  return a.architectures.length - b.architectures.length;
}
function parseTags(file) {
  var arr = file.split('.');
  var extension = arr.pop();
  var tags = {
    file: file,
    specificity: 0
  };
  if (extension !== 'node') return;
  for (var i = 0; i < arr.length; i++) {
    var tag = arr[i];
    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
      tags.runtime = tag;
    } else if (tag === 'napi') {
      tags.napi = true;
    } else if (tag.slice(0, 3) === 'abi') {
      tags.abi = tag.slice(3);
    } else if (tag.slice(0, 2) === 'uv') {
      tags.uv = tag.slice(2);
    } else if (tag.slice(0, 4) === 'armv') {
      tags.armv = tag.slice(4);
    } else if (tag === 'glibc' || tag === 'musl') {
      tags.libc = tag;
    } else {
      continue;
    }
    tags.specificity++;
  }
  return tags;
}
function matchTags(runtime, abi) {
  return function (tags) {
    if (tags == null) return false;
    if (tags.runtime && tags.runtime !== runtime && !runtimeAgnostic(tags)) return false;
    if (tags.abi && tags.abi !== abi && !tags.napi) return false;
    if (tags.uv && tags.uv !== uv) return false;
    if (tags.armv && tags.armv !== armv) return false;
    if (tags.libc && tags.libc !== libc) return false;
    return true;
  };
}
function runtimeAgnostic(tags) {
  return tags.runtime === 'node' && tags.napi;
}
function compareTags(runtime) {
  // Precedence: non-agnostic runtime, abi over napi, then by specificity.
  return function (a, b) {
    if (a.runtime !== b.runtime) {
      return a.runtime === runtime ? -1 : 1;
    } else if (a.abi !== b.abi) {
      return a.abi ? -1 : 1;
    } else if (a.specificity !== b.specificity) {
      return a.specificity > b.specificity ? -1 : 1;
    } else {
      return 0;
    }
  };
}
function isNwjs() {
  return !!(process.versions && process.versions.nw);
}
function isElectron() {
  if (process.versions && process.versions.electron) return true;
  if (process.env.ELECTRON_RUN_AS_NODE) return true;
  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
}
function isAlpine(platform) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release');
}

// Exposed for unit tests
// TODO: move to lib
load.parseTags = parseTags;
load.matchTags = matchTags;
load.compareTags = compareTags;
load.parseTuple = parseTuple;
load.matchTuple = matchTuple;
load.compareTuples = compareTuples;

/***/ }),

/***/ "./node_modules/usb/dist/index.js":
/*!****************************************!*\
  !*** ./node_modules/usb/dist/index.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.LibUSBException = exports.useUsbDkBackend = exports.getDeviceList = exports.Transfer = exports.Device = exports.webusb = exports.findBySerialNumber = exports.findByIds = exports.usb = void 0;
const util_1 = __webpack_require__(/*! util */ "util");
const webusb_1 = __webpack_require__(/*! ./webusb */ "./node_modules/usb/dist/webusb/index.js");
const usb = __webpack_require__(/*! ./usb */ "./node_modules/usb/dist/usb/index.js");
exports.usb = usb;
/**
 * Convenience method to get the first device with the specified VID and PID, or `undefined` if no such device is present.
 * @param vid
 * @param pid
 */
const findByIds = (vid, pid) => {
  const devices = usb.getDeviceList();
  return devices.find(item => item.deviceDescriptor.idVendor === vid && item.deviceDescriptor.idProduct === pid);
};
exports.findByIds = findByIds;
/**
 * Convenience method to get the device with the specified serial number, or `undefined` if no such device is present.
 * @param serialNumber
 */
const findBySerialNumber = async serialNumber => {
  const devices = usb.getDeviceList();
  const opened = device => !!device.interfaces;
  for (const device of devices) {
    try {
      if (!opened(device)) {
        device.open();
      }
      const getStringDescriptor = (0, util_1.promisify)(device.getStringDescriptor).bind(device);
      const buffer = await getStringDescriptor(device.deviceDescriptor.iSerialNumber);
      if (buffer && buffer.toString() === serialNumber) {
        return device;
      }
    } catch {
      // Ignore any errors, device may be a system device or inaccessible
    } finally {
      try {
        if (opened(device)) {
          device.close();
        }
      } catch {
        // Ignore any errors, device may be a system device or inaccessible
      }
    }
  }
  return undefined;
};
exports.findBySerialNumber = findBySerialNumber;
const webusb = new webusb_1.WebUSB();
exports.webusb = webusb;
// Usb types
var usb_1 = __webpack_require__(/*! ./usb */ "./node_modules/usb/dist/usb/index.js");
Object.defineProperty(exports, "Device", ({
  enumerable: true,
  get: function () {
    return usb_1.Device;
  }
}));
Object.defineProperty(exports, "Transfer", ({
  enumerable: true,
  get: function () {
    return usb_1.Transfer;
  }
}));
Object.defineProperty(exports, "getDeviceList", ({
  enumerable: true,
  get: function () {
    return usb_1.getDeviceList;
  }
}));
Object.defineProperty(exports, "useUsbDkBackend", ({
  enumerable: true,
  get: function () {
    return usb_1.useUsbDkBackend;
  }
}));
Object.defineProperty(exports, "LibUSBException", ({
  enumerable: true,
  get: function () {
    return usb_1.LibUSBException;
  }
}));
__exportStar(__webpack_require__(/*! ./usb/capability */ "./node_modules/usb/dist/usb/capability.js"), exports);
__exportStar(__webpack_require__(/*! ./usb/descriptors */ "./node_modules/usb/dist/usb/descriptors.js"), exports);
__exportStar(__webpack_require__(/*! ./usb/endpoint */ "./node_modules/usb/dist/usb/endpoint.js"), exports);
__exportStar(__webpack_require__(/*! ./usb/interface */ "./node_modules/usb/dist/usb/interface.js"), exports);
// WebUSB types
__exportStar(__webpack_require__(/*! ./webusb */ "./node_modules/usb/dist/webusb/index.js"), exports);
__exportStar(__webpack_require__(/*! ./webusb/webusb-device */ "./node_modules/usb/dist/webusb/webusb-device.js"), exports);

/***/ }),

/***/ "./node_modules/usb/dist/usb/bindings.js":
/*!***********************************************!*\
  !*** ./node_modules/usb/dist/usb/bindings.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


// Definitions from DefinitelyTyped, thanks to:
//  Eric Brody <https://github.com/underscorebrody>
//  Rob Moran <https://github.com/thegecko>
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
const path_1 = __webpack_require__(/*! path */ "path");
/* eslint-disable @typescript-eslint/no-var-requires */
const usb = __webpack_require__(/*! node-gyp-build */ "./node_modules/node-gyp-build/index.js")((0, path_1.join)(__dirname, '..', '..'));
module.exports = usb;

/***/ }),

/***/ "./node_modules/usb/dist/usb/capability.js":
/*!*************************************************!*\
  !*** ./node_modules/usb/dist/usb/capability.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Capability = void 0;
class Capability {
  constructor(device, id) {
    this.device = device;
    this.id = id;
    if (!device._bosDescriptor) {
      throw new Error('bosDescriptor not found');
    }
    this.descriptor = device._bosDescriptor.capabilities[this.id];
    this.type = this.descriptor.bDevCapabilityType;
    this.data = this.descriptor.dev_capability_data;
  }
}
exports.Capability = Capability;

/***/ }),

/***/ "./node_modules/usb/dist/usb/descriptors.js":
/*!**************************************************!*\
  !*** ./node_modules/usb/dist/usb/descriptors.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

/***/ }),

/***/ "./node_modules/usb/dist/usb/device.js":
/*!*********************************************!*\
  !*** ./node_modules/usb/dist/usb/device.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ExtendedDevice = void 0;
const usb = __webpack_require__(/*! ./bindings */ "./node_modules/usb/dist/usb/bindings.js");
const interface_1 = __webpack_require__(/*! ./interface */ "./node_modules/usb/dist/usb/interface.js");
const capability_1 = __webpack_require__(/*! ./capability */ "./node_modules/usb/dist/usb/capability.js");
const isBuffer = obj => !!obj && obj instanceof Uint8Array;
const DEFAULT_TIMEOUT = 1000;
class ExtendedDevice {
  constructor() {
    this._timeout = DEFAULT_TIMEOUT;
  }
  /**
   * Timeout in milliseconds to use for control transfers.
   */
  get timeout() {
    return this._timeout || DEFAULT_TIMEOUT;
  }
  set timeout(value) {
    this._timeout = value;
  }
  /**
   * Object with properties for the fields of the active configuration descriptor.
   */
  get configDescriptor() {
    try {
      return this.__getConfigDescriptor();
    } catch (e) {
      // Check descriptor exists
      if (e.errno === usb.LIBUSB_ERROR_NOT_FOUND) {
        return undefined;
      }
      throw e;
    }
  }
  /**
   * Contains all config descriptors of the device (same structure as .configDescriptor above)
   */
  get allConfigDescriptors() {
    try {
      return this.__getAllConfigDescriptors();
    } catch (e) {
      // Check descriptors exist
      if (e.errno === usb.LIBUSB_ERROR_NOT_FOUND) {
        return [];
      }
      throw e;
    }
  }
  /**
   * Contains the parent of the device, such as a hub. If there is no parent this property is set to `null`.
   */
  get parent() {
    return this.__getParent();
  }
  /**
   * Open the device.
   * @param defaultConfig
   */
  open(defaultConfig = true) {
    this.__open();
    // The presence of interfaces is used to determine if the device is open
    this.interfaces = [];
    if (defaultConfig === false) {
      return;
    }
    const len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0;
    for (let i = 0; i < len; i++) {
      this.interfaces[i] = new interface_1.Interface(this, i);
    }
  }
  /**
   * Close the device.
   *
   * The device must be open to use this method.
   */
  close() {
    this.__close();
    this.interfaces = undefined;
  }
  /**
   * Set the device configuration to something other than the default (0). To use this, first call `.open(false)` (which tells it not to auto configure),
   * then before claiming an interface, call this method.
   *
   * The device must be open to use this method.
   * @param desired
   * @param callback
   */
  setConfiguration(desired, callback) {
    this.__setConfiguration(desired, error => {
      if (!error) {
        this.interfaces = [];
        const len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0;
        for (let i = 0; i < len; i++) {
          this.interfaces[i] = new interface_1.Interface(this, i);
        }
      }
      if (callback) {
        callback.call(this, error);
      }
    });
  }
  /**
   * Perform a control transfer with `libusb_control_transfer`.
   *
   * Parameter `data_or_length` can be an integer length for an IN transfer, or a `Buffer` for an OUT transfer. The type must match the direction specified in the MSB of bmRequestType.
   *
   * The `data` parameter of the callback is actual transferred for OUT transfers, or will be passed a Buffer for IN transfers.
   *
   * The device must be open to use this method.
   * @param bmRequestType
   * @param bRequest
   * @param wValue
   * @param wIndex
   * @param data_or_length
   * @param callback
   */
  controlTransfer(bmRequestType, bRequest, wValue, wIndex, data_or_length, callback) {
    const isIn = !!(bmRequestType & usb.LIBUSB_ENDPOINT_IN);
    const wLength = isIn ? data_or_length : data_or_length.length;
    if (isIn) {
      if (wLength < 0) {
        throw new TypeError('Expected size number for IN transfer (based on bmRequestType)');
      }
    } else {
      if (!isBuffer(data_or_length)) {
        throw new TypeError('Expected buffer for OUT transfer (based on bmRequestType)');
      }
    }
    // Buffer for the setup packet
    // http://libusbx.sourceforge.net/api-1.0/structlibusb__control__setup.html
    const buf = Buffer.alloc(wLength + usb.LIBUSB_CONTROL_SETUP_SIZE);
    buf.writeUInt8(bmRequestType, 0);
    buf.writeUInt8(bRequest, 1);
    buf.writeUInt16LE(wValue, 2);
    buf.writeUInt16LE(wIndex, 4);
    buf.writeUInt16LE(wLength, 6);
    if (!isIn) {
      buf.set(data_or_length, usb.LIBUSB_CONTROL_SETUP_SIZE);
    }
    const transfer = new usb.Transfer(this, 0, usb.LIBUSB_TRANSFER_TYPE_CONTROL, this.timeout, (error, buf, actual) => {
      if (callback) {
        if (isIn) {
          callback.call(this, error, buf.slice(usb.LIBUSB_CONTROL_SETUP_SIZE, usb.LIBUSB_CONTROL_SETUP_SIZE + actual));
        } else {
          callback.call(this, error, actual);
        }
      }
    });
    try {
      transfer.submit(buf);
    } catch (e) {
      if (callback) {
        process.nextTick(() => callback.call(this, e, undefined));
      }
    }
    return this;
  }
  /**
   * Return the interface with the specified interface number.
   *
   * The device must be open to use this method.
   * @param addr
   */
  interface(addr) {
    if (!this.interfaces) {
      throw new Error('Device must be open before searching for interfaces');
    }
    addr = addr || 0;
    for (let i = 0; i < this.interfaces.length; i++) {
      if (this.interfaces[i].interfaceNumber === addr) {
        return this.interfaces[i];
      }
    }
    throw new Error(`Interface not found for address: ${addr}`);
  }
  /**
   * Perform a control transfer to retrieve a string descriptor
   *
   * The device must be open to use this method.
   * @param desc_index
   * @param callback
   */
  getStringDescriptor(desc_index, callback) {
    // Index 0 indicates null
    if (desc_index === 0) {
      callback();
      return;
    }
    const langid = 0x0409;
    const length = 255;
    this.controlTransfer(usb.LIBUSB_ENDPOINT_IN, usb.LIBUSB_REQUEST_GET_DESCRIPTOR, usb.LIBUSB_DT_STRING << 8 | desc_index, langid, length, (error, buffer) => {
      if (error) {
        return callback(error);
      }
      callback(undefined, isBuffer(buffer) ? buffer.toString('utf16le', 2) : undefined);
    });
  }
  /**
   * Perform a control transfer to retrieve an object with properties for the fields of the Binary Object Store descriptor.
   *
   * The device must be open to use this method.
   * @param callback
   */
  getBosDescriptor(callback) {
    if (this._bosDescriptor) {
      // Cached descriptor
      return callback(undefined, this._bosDescriptor);
    }
    if (this.deviceDescriptor.bcdUSB < 0x201) {
      // BOS is only supported from USB 2.0.1
      return callback(undefined, undefined);
    }
    this.controlTransfer(usb.LIBUSB_ENDPOINT_IN, usb.LIBUSB_REQUEST_GET_DESCRIPTOR, usb.LIBUSB_DT_BOS << 8, 0, usb.LIBUSB_DT_BOS_SIZE, (error, buffer) => {
      if (error) {
        // Check BOS descriptor exists
        if (error.errno === usb.LIBUSB_TRANSFER_STALL) return callback(undefined, undefined);
        return callback(error, undefined);
      }
      if (!isBuffer(buffer)) {
        return callback(undefined, undefined);
      }
      const totalLength = buffer.readUInt16LE(2);
      this.controlTransfer(usb.LIBUSB_ENDPOINT_IN, usb.LIBUSB_REQUEST_GET_DESCRIPTOR, usb.LIBUSB_DT_BOS << 8, 0, totalLength, (error, buffer) => {
        if (error) {
          // Check BOS descriptor exists
          if (error.errno === usb.LIBUSB_TRANSFER_STALL) return callback(undefined, undefined);
          return callback(error, undefined);
        }
        if (!isBuffer(buffer)) {
          return callback(undefined, undefined);
        }
        const descriptor = {
          bLength: buffer.readUInt8(0),
          bDescriptorType: buffer.readUInt8(1),
          wTotalLength: buffer.readUInt16LE(2),
          bNumDeviceCaps: buffer.readUInt8(4),
          capabilities: []
        };
        let i = usb.LIBUSB_DT_BOS_SIZE;
        while (i < descriptor.wTotalLength) {
          const capability = {
            bLength: buffer.readUInt8(i + 0),
            bDescriptorType: buffer.readUInt8(i + 1),
            bDevCapabilityType: buffer.readUInt8(i + 2),
            dev_capability_data: buffer.slice(i + 3, i + buffer.readUInt8(i + 0))
          };
          descriptor.capabilities.push(capability);
          i += capability.bLength;
        }
        // Cache descriptor
        this._bosDescriptor = descriptor;
        callback(undefined, this._bosDescriptor);
      });
    });
  }
  /**
   * Retrieve a list of Capability objects for the Binary Object Store capabilities of the device.
   *
   * The device must be open to use this method.
   * @param callback
   */
  getCapabilities(callback) {
    const capabilities = [];
    this.getBosDescriptor((error, descriptor) => {
      if (error) return callback(error, undefined);
      const len = descriptor ? descriptor.capabilities.length : 0;
      for (let i = 0; i < len; i++) {
        capabilities.push(new capability_1.Capability(this, i));
      }
      callback(undefined, capabilities);
    });
  }
}
exports.ExtendedDevice = ExtendedDevice;

/***/ }),

/***/ "./node_modules/usb/dist/usb/endpoint.js":
/*!***********************************************!*\
  !*** ./node_modules/usb/dist/usb/endpoint.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.OutEndpoint = exports.InEndpoint = exports.Endpoint = void 0;
const events_1 = __webpack_require__(/*! events */ "events");
const bindings_1 = __webpack_require__(/*! ./bindings */ "./node_modules/usb/dist/usb/bindings.js");
const util_1 = __webpack_require__(/*! util */ "util");
const isBuffer = obj => obj && obj instanceof Uint8Array;
/** Common base for InEndpoint and OutEndpoint. */
class Endpoint extends events_1.EventEmitter {
  constructor(device, descriptor) {
    super();
    this.device = device;
    /** Sets the timeout in milliseconds for transfers on this endpoint. The default, `0`, is infinite timeout. */
    this.timeout = 0;
    this.descriptor = descriptor;
    this.address = descriptor.bEndpointAddress;
    this.transferType = descriptor.bmAttributes & 0x03;
  }
  /** Clear the halt/stall condition for this endpoint. */
  clearHalt(callback) {
    return this.device.__clearHalt(this.address, callback);
  }
  /**
   * Create a new `Transfer` object for this endpoint.
   *
   * The passed callback will be called when the transfer is submitted and finishes. Its arguments are the error (if any), the submitted buffer, and the amount of data actually written (for
   * OUT transfers) or read (for IN transfers).
   *
   * @param timeout Timeout for the transfer (0 means unlimited).
   * @param callback Transfer completion callback.
   */
  makeTransfer(timeout, callback) {
    return new bindings_1.Transfer(this.device, this.address, this.transferType, timeout, callback);
  }
}
exports.Endpoint = Endpoint;
/** Endpoints in the IN direction (device->PC) have this type. */
class InEndpoint extends Endpoint {
  constructor(device, descriptor) {
    super(device, descriptor);
    /** Endpoint direction. */
    this.direction = 'in';
    this.pollTransfers = [];
    this.pollTransferSize = 0;
    this.pollPending = 0;
    this.pollActive = false;
    this.transferAsync = (0, util_1.promisify)(this.transfer).bind(this);
  }
  /**
   * Perform a transfer to read data from the endpoint.
   *
   * If length is greater than maxPacketSize, libusb will automatically split the transfer in multiple packets, and you will receive one callback with all data once all packets are complete.
   *
   * `this` in the callback is the InEndpoint object.
   *
   * The device must be open to use this method.
   * @param length
   * @param callback
   */
  transfer(length, callback) {
    const buffer = Buffer.alloc(length);
    const cb = (error, _buffer, actualLength) => {
      callback.call(this, error, buffer.slice(0, actualLength));
    };
    try {
      this.makeTransfer(this.timeout, cb).submit(buffer);
    } catch (e) {
      process.nextTick(() => callback.call(this, e));
    }
    return this;
  }
  /**
   * Start polling the endpoint.
   *
   * The library will keep `nTransfers` transfers of size `transferSize` pending in the kernel at all times to ensure continuous data flow.
   * This is handled by the libusb event thread, so it continues even if the Node v8 thread is busy. The `data` and `error` events are emitted as transfers complete.
   *
   * The device must be open to use this method.
   * @param nTransfers
   * @param transferSize
   * @param callback
   */
  startPoll(nTransfers, transferSize, callback) {
    const transferDone = (error, transfer, buffer, actualLength) => {
      if (!error) {
        this.emit('data', buffer.slice(0, actualLength));
      } else if (error.errno !== bindings_1.LIBUSB_TRANSFER_CANCELLED) {
        if (this.pollActive) {
          this.emit('error', error);
          this.stopPoll();
        }
      }
      if (this.pollActive) {
        startTransfer(transfer);
      } else {
        this.pollPending--;
        if (this.pollPending === 0) {
          this.pollTransfers = [];
          this.pollActive = false;
          this.emit('end');
          if (callback) {
            const cancelled = (error === null || error === void 0 ? void 0 : error.errno) === bindings_1.LIBUSB_TRANSFER_CANCELLED;
            callback(cancelled ? undefined : error, buffer, actualLength, cancelled);
          }
        }
      }
    };
    const startTransfer = transfer => {
      try {
        transfer.submit(Buffer.alloc(this.pollTransferSize), (error, buffer, actualLength) => {
          transferDone(error, transfer, buffer, actualLength);
        });
      } catch (e) {
        this.emit('error', e);
        this.stopPoll();
      }
    };
    this.pollTransfers = this.startPollTransfers(nTransfers, transferSize, function (error, buffer, actualLength) {
      transferDone(error, this, buffer, actualLength);
    });
    this.pollTransfers.forEach(startTransfer);
    this.pollPending = this.pollTransfers.length;
    return this.pollTransfers;
  }
  startPollTransfers(nTransfers = 3, transferSize = this.descriptor.wMaxPacketSize, callback) {
    if (this.pollActive) {
      throw new Error('Polling already active');
    }
    this.pollTransferSize = transferSize;
    this.pollActive = true;
    this.pollPending = 0;
    const transfers = [];
    for (let i = 0; i < nTransfers; i++) {
      const transfer = this.makeTransfer(0, callback);
      transfers[i] = transfer;
    }
    return transfers;
  }
  /**
   * Stop polling.
   *
   * Further data may still be received. The `end` event is emitted and the callback is called once all transfers have completed or canceled.
   *
   * The device must be open to use this method.
   * @param callback
   */
  stopPoll(callback) {
    if (!this.pollActive) {
      throw new Error('Polling is not active.');
    }
    for (let i = 0; i < this.pollTransfers.length; i++) {
      try {
        this.pollTransfers[i].cancel();
      } catch (error) {
        this.emit('error', error);
      }
    }
    this.pollActive = false;
    if (callback) this.once('end', callback);
  }
}
exports.InEndpoint = InEndpoint;
/** Endpoints in the OUT direction (PC->device) have this type. */
class OutEndpoint extends Endpoint {
  constructor(device, descriptor) {
    super(device, descriptor);
    /** Endpoint direction. */
    this.direction = 'out';
    this.transferAsync = (0, util_1.promisify)(this.transfer).bind(this);
  }
  /**
   * Perform a transfer to write `data` to the endpoint.
   *
   * If length is greater than maxPacketSize, libusb will automatically split the transfer in multiple packets, and you will receive one callback once all packets are complete.
   *
   * `this` in the callback is the OutEndpoint object.
   *
   * The device must be open to use this method.
   * @param buffer
   * @param callback
   */
  transfer(buffer, callback) {
    if (!buffer) {
      buffer = Buffer.alloc(0);
    } else if (!isBuffer(buffer)) {
      buffer = Buffer.from(buffer);
    }
    const cb = (error, _buffer, actual) => {
      if (callback) {
        callback.call(this, error, actual || 0);
      }
    };
    try {
      this.makeTransfer(this.timeout, cb).submit(buffer);
    } catch (e) {
      process.nextTick(() => cb(e));
    }
    return this;
  }
  transferWithZLP(buffer, callback) {
    if (buffer.length % this.descriptor.wMaxPacketSize === 0) {
      this.transfer(buffer);
      this.transfer(Buffer.alloc(0), callback);
    } else {
      this.transfer(buffer, callback);
    }
  }
}
exports.OutEndpoint = OutEndpoint;

/***/ }),

/***/ "./node_modules/usb/dist/usb/index.js":
/*!********************************************!*\
  !*** ./node_modules/usb/dist/usb/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const events_1 = __webpack_require__(/*! events */ "events");
const device_1 = __webpack_require__(/*! ./device */ "./node_modules/usb/dist/usb/device.js");
const usb = __webpack_require__(/*! ./bindings */ "./node_modules/usb/dist/usb/bindings.js");
if (usb.INIT_ERROR) {
  /* eslint-disable no-console */
  console.warn('Failed to initialize libusb.');
}
Object.setPrototypeOf(usb, events_1.EventEmitter.prototype);
Object.defineProperty(usb, 'pollHotplug', {
  value: false,
  writable: true
});
Object.defineProperty(usb, 'pollHotplugDelay', {
  value: 500,
  writable: true
});
// `usb.Device` is not defined when `usb.INIT_ERROR` is true
if (usb.Device) {
  Object.getOwnPropertyNames(device_1.ExtendedDevice.prototype).forEach(name => {
    Object.defineProperty(usb.Device.prototype, name, Object.getOwnPropertyDescriptor(device_1.ExtendedDevice.prototype, name) || Object.create(null));
  });
}
// Devices delta support for non-libusb hotplug events
let hotPlugDevices = new Set();
// This method needs to be used for attach/detach IDs (hotplugSupportType === 2) rather than a lookup because vid/pid are not unique
const emitHotplugEvents = () => {
  // Collect current devices
  const devices = new Set(usb.getDeviceList());
  // Find attached devices
  for (const device of devices) {
    if (!hotPlugDevices.has(device)) {
      usb.emit('attach', device);
    }
  }
  // Find detached devices
  for (const device of hotPlugDevices) {
    if (!devices.has(device)) {
      usb.emit('detach', device);
    }
  }
  hotPlugDevices = devices;
};
// Polling mechanism for checking device changes where hotplug detection is not available
let pollingHotplug = false;
const pollHotplug = (start = false) => {
  if (start) {
    pollingHotplug = true;
  } else if (!pollingHotplug) {
    return;
  } else {
    emitHotplugEvents();
  }
  setTimeout(() => pollHotplug(), usb.pollHotplugDelay);
};
// Devices changed event handler
const devicesChanged = () => setTimeout(() => emitHotplugEvents(), usb.pollHotplugDelay);
// Hotplug control
let hotplugSupported = 0;
const startHotplug = () => {
  hotplugSupported = usb.pollHotplug ? 0 : usb._supportedHotplugEvents();
  if (hotplugSupported !== 1) {
    // Collect initial devices when not using libusb
    hotPlugDevices = new Set(usb.getDeviceList());
  }
  if (hotplugSupported) {
    // Use hotplug event emitters
    usb._enableHotplugEvents();
    if (hotplugSupported === 2) {
      // Use hotplug ID events to trigger a change check
      usb.on('attachIds', devicesChanged);
      usb.on('detachIds', devicesChanged);
    }
  } else {
    // Fallback to using polling to check for changes
    pollHotplug(true);
  }
};
const stopHotplug = () => {
  if (hotplugSupported) {
    // Disable hotplug events
    usb._disableHotplugEvents();
    if (hotplugSupported === 2) {
      // Remove hotplug ID event listeners
      usb.off('attachIds', devicesChanged);
      usb.off('detachIds', devicesChanged);
    }
  } else {
    // Stop polling
    pollingHotplug = false;
  }
};
usb.on('newListener', event => {
  if (event !== 'attach' && event !== 'detach') {
    return;
  }
  const listenerCount = usb.listenerCount('attach') + usb.listenerCount('detach');
  if (listenerCount === 0) {
    startHotplug();
  }
});
usb.on('removeListener', event => {
  if (event !== 'attach' && event !== 'detach') {
    return;
  }
  const listenerCount = usb.listenerCount('attach') + usb.listenerCount('detach');
  if (listenerCount === 0) {
    stopHotplug();
  }
});
module.exports = usb;

/***/ }),

/***/ "./node_modules/usb/dist/usb/interface.js":
/*!************************************************!*\
  !*** ./node_modules/usb/dist/usb/interface.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.Interface = void 0;
const bindings_1 = __webpack_require__(/*! ./bindings */ "./node_modules/usb/dist/usb/bindings.js");
const endpoint_1 = __webpack_require__(/*! ./endpoint */ "./node_modules/usb/dist/usb/endpoint.js");
const util_1 = __webpack_require__(/*! util */ "util");
class Interface {
  constructor(device, id) {
    this.device = device;
    this.id = id;
    /** Integer alternate setting number. */
    this.altSetting = 0;
    this.refresh();
    this.releaseAsync = (0, util_1.promisify)(this.release).bind(this);
    this.setAltSettingAsync = (0, util_1.promisify)(this.setAltSetting).bind(this);
  }
  refresh() {
    if (!this.device.configDescriptor) {
      return;
    }
    this.descriptor = this.device.configDescriptor.interfaces[this.id][this.altSetting];
    this.interfaceNumber = this.descriptor.bInterfaceNumber;
    this.endpoints = [];
    const len = this.descriptor.endpoints.length;
    for (let i = 0; i < len; i++) {
      const desc = this.descriptor.endpoints[i];
      const c = desc.bEndpointAddress & bindings_1.LIBUSB_ENDPOINT_IN ? endpoint_1.InEndpoint : endpoint_1.OutEndpoint;
      this.endpoints[i] = new c(this.device, desc);
    }
  }
  /**
   * Claims the interface. This method must be called before using any endpoints of this interface.
   *
   * The device must be open to use this method.
   */
  claim() {
    this.device.__claimInterface(this.id);
  }
  release(closeEndpointsOrCallback, callback) {
    let closeEndpoints = false;
    if (typeof closeEndpointsOrCallback === 'boolean') {
      closeEndpoints = closeEndpointsOrCallback;
    } else {
      callback = closeEndpointsOrCallback;
    }
    const next = () => {
      this.device.__releaseInterface(this.id, error => {
        if (!error) {
          this.altSetting = 0;
          this.refresh();
        }
        if (callback) {
          callback.call(this, error);
        }
      });
    };
    if (!closeEndpoints || this.endpoints.length === 0) {
      next();
    } else {
      let n = this.endpoints.length;
      this.endpoints.forEach(ep => {
        if (ep.direction === 'in' && ep.pollActive) {
          ep.once('end', () => {
            if (--n === 0) {
              next();
            }
          });
          ep.stopPoll();
        } else {
          if (--n === 0) {
            next();
          }
        }
      });
    }
  }
  /**
   * Returns `false` if a kernel driver is not active; `true` if active.
   *
   * The device must be open to use this method.
   */
  isKernelDriverActive() {
    return this.device.__isKernelDriverActive(this.id);
  }
  /**
   * Detaches the kernel driver from the interface.
   *
   * The device must be open to use this method.
   */
  detachKernelDriver() {
    return this.device.__detachKernelDriver(this.id);
  }
  /**
   * Re-attaches the kernel driver for the interface.
   *
   * The device must be open to use this method.
   */
  attachKernelDriver() {
    return this.device.__attachKernelDriver(this.id);
  }
  /**
   * Sets the alternate setting. It updates the `interface.endpoints` array to reflect the endpoints found in the alternate setting.
   *
   * The device must be open to use this method.
   * @param altSetting
   * @param callback
   */
  setAltSetting(altSetting, callback) {
    this.device.__setInterface(this.id, altSetting, error => {
      if (!error) {
        this.altSetting = altSetting;
        this.refresh();
      }
      if (callback) {
        callback.call(this, error);
      }
    });
  }
  /**
   * Return the InEndpoint or OutEndpoint with the specified address.
   *
   * The device must be open to use this method.
   * @param addr
   */
  endpoint(addr) {
    return this.endpoints.find(item => item.address === addr);
  }
}
exports.Interface = Interface;

/***/ }),

/***/ "./node_modules/usb/dist/webusb/index.js":
/*!***********************************************!*\
  !*** ./node_modules/usb/dist/webusb/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WebUSB = exports.getWebUsb = void 0;
const usb = __webpack_require__(/*! ../usb */ "./node_modules/usb/dist/usb/index.js");
const events_1 = __webpack_require__(/*! events */ "events");
const webusb_device_1 = __webpack_require__(/*! ./webusb-device */ "./node_modules/usb/dist/webusb/webusb-device.js");
/**
 * Convenience method to get the WebUSB interface available
 */
const getWebUsb = () => {
  if (navigator && navigator.usb) {
    return navigator.usb;
  }
  return new WebUSB();
};
exports.getWebUsb = getWebUsb;
class NamedError extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
}
class WebUSB {
  constructor(options = {}) {
    this.options = options;
    this.emitter = new events_1.EventEmitter();
    this.knownDevices = new Map();
    this.authorisedDevices = new Set();
    const deviceConnectCallback = async device => {
      const webDevice = await this.getWebDevice(device);
      // When connected, emit an event if it is an allowed device
      if (webDevice && this.isAuthorisedDevice(webDevice)) {
        const event = {
          type: 'connect',
          device: webDevice
        };
        this.emitter.emit('connect', event);
      }
    };
    const deviceDisconnectCallback = async device => {
      // When disconnected, emit an event if the device was a known allowed device
      if (this.knownDevices.has(device)) {
        const webDevice = this.knownDevices.get(device);
        if (webDevice && this.isAuthorisedDevice(webDevice)) {
          const event = {
            type: 'disconnect',
            device: webDevice
          };
          this.emitter.emit('disconnect', event);
        }
      }
    };
    this.emitter.on('newListener', event => {
      const listenerCount = this.emitter.listenerCount(event);
      if (listenerCount !== 0) {
        return;
      }
      if (event === 'connect') {
        usb.addListener('attach', deviceConnectCallback);
      } else if (event === 'disconnect') {
        usb.addListener('detach', deviceDisconnectCallback);
      }
    });
    this.emitter.on('removeListener', event => {
      const listenerCount = this.emitter.listenerCount(event);
      if (listenerCount !== 0) {
        return;
      }
      if (event === 'connect') {
        usb.removeListener('attach', deviceConnectCallback);
      } else if (event === 'disconnect') {
        usb.removeListener('detach', deviceDisconnectCallback);
      }
    });
  }
  set onconnect(fn) {
    if (this._onconnect) {
      this.removeEventListener('connect', this._onconnect);
      this._onconnect = undefined;
    }
    if (fn) {
      this._onconnect = fn;
      this.addEventListener('connect', this._onconnect);
    }
  }
  set ondisconnect(fn) {
    if (this._ondisconnect) {
      this.removeEventListener('disconnect', this._ondisconnect);
      this._ondisconnect = undefined;
    }
    if (fn) {
      this._ondisconnect = fn;
      this.addEventListener('disconnect', this._ondisconnect);
    }
  }
  addEventListener(type, listener) {
    this.emitter.addListener(type, listener);
  }
  removeEventListener(type, callback) {
    this.emitter.removeListener(type, callback);
  }
  dispatchEvent(_event) {
    // Don't dispatch from here
    return false;
  }
  /**
   * Requests a single Web USB device
   * @param options The options to use when scanning
   * @returns Promise containing the selected device
   */
  async requestDevice(options) {
    // Must have options
    if (!options) {
      throw new TypeError('requestDevice error: 1 argument required, but only 0 present');
    }
    // Options must be an object
    if (options.constructor !== {}.constructor) {
      throw new TypeError('requestDevice error: parameter 1 (options) is not an object');
    }
    // Must have a filter
    if (!options.filters) {
      throw new TypeError('requestDevice error: required member filters is undefined');
    }
    // Filter must be an array
    if (options.filters.constructor !== [].constructor) {
      throw new TypeError('requestDevice error: the provided value cannot be converted to a sequence');
    }
    // Check filters
    options.filters.forEach(filter => {
      // Protocol & Subclass
      if (filter.protocolCode && !filter.subclassCode) {
        throw new TypeError('requestDevice error: subclass code is required');
      }
      // Subclass & Class
      if (filter.subclassCode && !filter.classCode) {
        throw new TypeError('requestDevice error: class code is required');
      }
    });
    let devices = await this.loadDevices(options.filters);
    devices = devices.filter(device => this.filterDevice(device, options.filters));
    if (devices.length === 0) {
      throw new NamedError('Failed to execute \'requestDevice\' on \'USB\': No device selected.', 'NotFoundError');
    }
    try {
      // If no devicesFound function, select the first device found
      const device = this.options.devicesFound ? await this.options.devicesFound(devices) : devices[0];
      if (!device) {
        throw new NamedError('Failed to execute \'requestDevice\' on \'USB\': No device selected.', 'NotFoundError');
      }
      this.authorisedDevices.add({
        vendorId: device.vendorId,
        productId: device.productId,
        classCode: device.deviceClass,
        subclassCode: device.deviceSubclass,
        protocolCode: device.deviceProtocol,
        serialNumber: device.serialNumber
      });
      return device;
    } catch (error) {
      throw new NamedError('Failed to execute \'requestDevice\' on \'USB\': No device selected.', 'NotFoundError');
    }
  }
  /**
   * Gets all allowed Web USB devices which are connected
   * @returns Promise containing an array of devices
   */
  async getDevices() {
    const preFilters = this.options.allowAllDevices ? undefined : this.options.allowedDevices;
    // Refresh devices and filter for allowed ones
    const devices = await this.loadDevices(preFilters);
    return devices.filter(device => this.isAuthorisedDevice(device));
  }
  async loadDevices(preFilters) {
    let devices = usb.getDeviceList();
    // Pre-filter devices
    devices = this.quickFilter(devices, preFilters);
    const refreshedKnownDevices = new Map();
    for (const device of devices) {
      const webDevice = await this.getWebDevice(device);
      if (webDevice) {
        refreshedKnownDevices.set(device, webDevice);
      }
    }
    // Refresh knownDevices to remove old devices from the map
    this.knownDevices = refreshedKnownDevices;
    return [...this.knownDevices.values()];
  }
  // Get a WebUSBDevice corresponding to underlying device.
  // Returns undefined the device was not found and could not be created.
  async getWebDevice(device) {
    if (!this.knownDevices.has(device)) {
      if (this.options.deviceTimeout) {
        device.timeout = this.options.deviceTimeout;
      }
      try {
        const webDevice = await webusb_device_1.WebUSBDevice.createInstance(device);
        this.knownDevices.set(device, webDevice);
      } catch {
        // Ignore creation issues as this may be a system device
      }
    }
    return this.knownDevices.get(device);
  }
  // Undertake quick filter on devices before creating WebUSB devices if possible
  quickFilter(devices, preFilters) {
    if (!preFilters || !preFilters.length) {
      return devices;
    }
    // Just pre-filter on vid/pid
    return devices.filter(device => preFilters.some(filter => {
      // Vendor
      if (filter.vendorId && filter.vendorId !== device.deviceDescriptor.idVendor) return false;
      // Product
      if (filter.productId && filter.productId !== device.deviceDescriptor.idProduct) return false;
      // Ignore Class, Subclass and Protocol as these need to check interfaces, too
      // Ignore serial number for node-usb as it requires device connection
      return true;
    }));
  }
  // Filter WebUSB devices
  filterDevice(device, filters) {
    if (!filters || !filters.length) {
      return true;
    }
    return filters.some(filter => {
      // Vendor
      if (filter.vendorId && filter.vendorId !== device.vendorId) return false;
      // Product
      if (filter.productId && filter.productId !== device.productId) return false;
      // Class
      if (filter.classCode) {
        if (!device.configuration) {
          return false;
        }
        // Interface Descriptors
        const match = device.configuration.interfaces.some(iface => {
          // Class
          if (filter.classCode && filter.classCode !== iface.alternate.interfaceClass) return false;
          // Subclass
          if (filter.subclassCode && filter.subclassCode !== iface.alternate.interfaceSubclass) return false;
          // Protocol
          if (filter.protocolCode && filter.protocolCode !== iface.alternate.interfaceProtocol) return false;
          return true;
        });
        if (match) {
          return true;
        }
      }
      // Class
      if (filter.classCode && filter.classCode !== device.deviceClass) return false;
      // Subclass
      if (filter.subclassCode && filter.subclassCode !== device.deviceSubclass) return false;
      // Protocol
      if (filter.protocolCode && filter.protocolCode !== device.deviceProtocol) return false;
      // Serial
      if (filter.serialNumber && filter.serialNumber !== device.serialNumber) return false;
      return true;
    });
  }
  // Check whether a device is authorised
  isAuthorisedDevice(device) {
    // All devices are authorised
    if (this.options.allowAllDevices) {
      return true;
    }
    // Check any allowed device filters
    if (this.options.allowedDevices && this.filterDevice(device, this.options.allowedDevices)) {
      return true;
    }
    // Check authorised devices
    return [...this.authorisedDevices.values()].some(authorised => authorised.vendorId === device.vendorId && authorised.productId === device.productId && authorised.classCode === device.deviceClass && authorised.subclassCode === device.deviceSubclass && authorised.protocolCode === device.deviceProtocol && authorised.serialNumber === device.serialNumber);
  }
}
exports.WebUSB = WebUSB;

/***/ }),

/***/ "./node_modules/usb/dist/webusb/webusb-device.js":
/*!*******************************************************!*\
  !*** ./node_modules/usb/dist/webusb/webusb-device.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WebUSBDevice = void 0;
const usb = __webpack_require__(/*! ../usb */ "./node_modules/usb/dist/usb/index.js");
const util_1 = __webpack_require__(/*! util */ "util");
const os_1 = __webpack_require__(/*! os */ "os");
const LIBUSB_TRANSFER_TYPE_MASK = 0x03;
const ENDPOINT_NUMBER_MASK = 0x7f;
const CLEAR_FEATURE = 0x01;
const ENDPOINT_HALT = 0x00;
/**
 * Wrapper to make a node-usb device look like a webusb device
 */
class WebUSBDevice {
  static async createInstance(device) {
    const instance = new WebUSBDevice(device);
    await instance.initialize();
    return instance;
  }
  constructor(device) {
    this.device = device;
    this.configurations = [];
    const usbVersion = this.decodeVersion(device.deviceDescriptor.bcdUSB);
    this.usbVersionMajor = usbVersion.major;
    this.usbVersionMinor = usbVersion.minor;
    this.usbVersionSubminor = usbVersion.sub;
    this.deviceClass = device.deviceDescriptor.bDeviceClass;
    this.deviceSubclass = device.deviceDescriptor.bDeviceSubClass;
    this.deviceProtocol = device.deviceDescriptor.bDeviceProtocol;
    this.vendorId = device.deviceDescriptor.idVendor;
    this.productId = device.deviceDescriptor.idProduct;
    const deviceVersion = this.decodeVersion(device.deviceDescriptor.bcdDevice);
    this.deviceVersionMajor = deviceVersion.major;
    this.deviceVersionMinor = deviceVersion.minor;
    this.deviceVersionSubminor = deviceVersion.sub;
    this.controlTransferAsync = (0, util_1.promisify)(this.device.controlTransfer).bind(this.device);
    this.setConfigurationAsync = (0, util_1.promisify)(this.device.setConfiguration).bind(this.device);
    this.resetAsync = (0, util_1.promisify)(this.device.reset).bind(this.device);
    this.getStringDescriptorAsync = (0, util_1.promisify)(this.device.getStringDescriptor).bind(this.device);
  }
  get configuration() {
    if (!this.device.configDescriptor) {
      return undefined;
    }
    const currentConfiguration = this.device.configDescriptor.bConfigurationValue;
    return this.configurations.find(configuration => configuration.configurationValue === currentConfiguration);
  }
  get opened() {
    return !!this.device.interfaces;
  }
  async open() {
    try {
      if (this.opened) {
        return;
      }
      this.device.open();
    } catch (error) {
      throw new Error(`open error: ${error}`);
    }
  }
  async close() {
    try {
      if (!this.opened) {
        return;
      }
      try {
        if (this.configuration) {
          for (const iface of this.configuration.interfaces) {
            await this._releaseInterface(iface.interfaceNumber);
            // Re-create the USBInterface to set the claimed attribute
            this.configuration.interfaces[this.configuration.interfaces.indexOf(iface)] = {
              interfaceNumber: iface.interfaceNumber,
              alternate: iface.alternate,
              alternates: iface.alternates,
              claimed: false
            };
          }
        }
      } catch (_error) {
        // Ignore
      }
      this.device.close();
    } catch (error) {
      throw new Error(`close error: ${error}`);
    }
  }
  async selectConfiguration(configurationValue) {
    if (!this.opened || !this.device.configDescriptor) {
      throw new Error('selectConfiguration error: invalid state');
    }
    if (this.device.configDescriptor.bConfigurationValue === configurationValue) {
      return;
    }
    const config = this.configurations.find(configuration => configuration.configurationValue === configurationValue);
    if (!config) {
      throw new Error('selectConfiguration error: configuration not found');
    }
    try {
      await this.setConfigurationAsync(configurationValue);
    } catch (error) {
      throw new Error(`selectConfiguration error: ${error}`);
    }
  }
  async claimInterface(interfaceNumber) {
    if (!this.opened) {
      throw new Error('claimInterface error: invalid state');
    }
    if (!this.configuration) {
      throw new Error('claimInterface error: interface not found');
    }
    const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
    if (!iface) {
      throw new Error('claimInterface error: interface not found');
    }
    if (iface.claimed) {
      return;
    }
    try {
      this.device.interface(interfaceNumber).claim();
      // Re-create the USBInterface to set the claimed attribute
      this.configuration.interfaces[this.configuration.interfaces.indexOf(iface)] = {
        interfaceNumber,
        alternate: iface.alternate,
        alternates: iface.alternates,
        claimed: true
      };
    } catch (error) {
      throw new Error(`claimInterface error: ${error}`);
    }
  }
  async releaseInterface(interfaceNumber) {
    await this._releaseInterface(interfaceNumber);
    if (this.configuration) {
      const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
      if (iface) {
        // Re-create the USBInterface to set the claimed attribute
        this.configuration.interfaces[this.configuration.interfaces.indexOf(iface)] = {
          interfaceNumber,
          alternate: iface.alternate,
          alternates: iface.alternates,
          claimed: false
        };
      }
    }
  }
  async selectAlternateInterface(interfaceNumber, alternateSetting) {
    if (!this.opened) {
      throw new Error('selectAlternateInterface error: invalid state');
    }
    if (!this.configuration) {
      throw new Error('selectAlternateInterface error: interface not found');
    }
    const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
    if (!iface) {
      throw new Error('selectAlternateInterface error: interface not found');
    }
    if (!iface.claimed) {
      throw new Error('selectAlternateInterface error: invalid state');
    }
    try {
      const iface = this.device.interface(interfaceNumber);
      await iface.setAltSettingAsync(alternateSetting);
    } catch (error) {
      throw new Error(`selectAlternateInterface error: ${error}`);
    }
  }
  async controlTransferIn(setup, length) {
    try {
      this.checkDeviceOpen();
      const type = this.controlTransferParamsToType(setup, usb.LIBUSB_ENDPOINT_IN);
      const result = await this.controlTransferAsync(type, setup.request, setup.value, setup.index, length);
      return {
        data: result ? new DataView(new Uint8Array(result).buffer) : undefined,
        status: 'ok'
      };
    } catch (error) {
      if (error.errno === usb.LIBUSB_TRANSFER_STALL) {
        return {
          status: 'stall'
        };
      }
      if (error.errno === usb.LIBUSB_TRANSFER_OVERFLOW) {
        return {
          status: 'babble'
        };
      }
      throw new Error(`controlTransferIn error: ${error}`);
    }
  }
  async controlTransferOut(setup, data) {
    try {
      this.checkDeviceOpen();
      const type = this.controlTransferParamsToType(setup, usb.LIBUSB_ENDPOINT_OUT);
      const buffer = data ? Buffer.from(data) : Buffer.alloc(0);
      const bytesWritten = await this.controlTransferAsync(type, setup.request, setup.value, setup.index, buffer);
      return {
        bytesWritten,
        status: 'ok'
      };
    } catch (error) {
      if (error.errno === usb.LIBUSB_TRANSFER_STALL) {
        return {
          bytesWritten: 0,
          status: 'stall'
        };
      }
      throw new Error(`controlTransferOut error: ${error}`);
    }
  }
  async clearHalt(direction, endpointNumber) {
    try {
      const wIndex = endpointNumber | (direction === 'in' ? usb.LIBUSB_ENDPOINT_IN : usb.LIBUSB_ENDPOINT_OUT);
      await this.controlTransferAsync(usb.LIBUSB_RECIPIENT_ENDPOINT, CLEAR_FEATURE, ENDPOINT_HALT, wIndex, Buffer.from(new Uint8Array()));
    } catch (error) {
      throw new Error(`clearHalt error: ${error}`);
    }
  }
  async transferIn(endpointNumber, length) {
    try {
      this.checkDeviceOpen();
      const endpoint = this.getEndpoint(endpointNumber | usb.LIBUSB_ENDPOINT_IN);
      const result = await endpoint.transferAsync(length);
      return {
        data: result ? new DataView(new Uint8Array(result).buffer) : undefined,
        status: 'ok'
      };
    } catch (error) {
      if (error.errno === usb.LIBUSB_TRANSFER_STALL) {
        return {
          status: 'stall'
        };
      }
      if (error.errno === usb.LIBUSB_TRANSFER_OVERFLOW) {
        return {
          status: 'babble'
        };
      }
      throw new Error(`transferIn error: ${error}`);
    }
  }
  async transferOut(endpointNumber, data) {
    try {
      this.checkDeviceOpen();
      const endpoint = this.getEndpoint(endpointNumber | usb.LIBUSB_ENDPOINT_OUT);
      const buffer = Buffer.from(data);
      const bytesWritten = await endpoint.transferAsync(buffer);
      return {
        bytesWritten,
        status: 'ok'
      };
    } catch (error) {
      if (error.errno === usb.LIBUSB_TRANSFER_STALL) {
        return {
          bytesWritten: 0,
          status: 'stall'
        };
      }
      throw new Error(`transferOut error: ${error}`);
    }
  }
  async reset() {
    try {
      await this.resetAsync();
    } catch (error) {
      throw new Error(`reset error: ${error}`);
    }
  }
  async isochronousTransferIn(_endpointNumber, _packetLengths) {
    throw new Error('isochronousTransferIn error: method not implemented');
  }
  async isochronousTransferOut(_endpointNumber, _data, _packetLengths) {
    throw new Error('isochronousTransferOut error: method not implemented');
  }
  async forget() {
    throw new Error('forget error: method not implemented');
  }
  async initialize() {
    try {
      if (!this.opened) {
        this.device.open();
        // Explicitly set configuration for vendor-specific devices on macos
        // https://github.com/node-usb/node-usb/issues/61
        if (this.deviceClass === 0xff && (0, os_1.platform)() === 'darwin') {
          await this.setConfigurationAsync(1);
        }
      }
      this.manufacturerName = await this.getStringDescriptor(this.device.deviceDescriptor.iManufacturer);
      this.productName = await this.getStringDescriptor(this.device.deviceDescriptor.iProduct);
      this.serialNumber = await this.getStringDescriptor(this.device.deviceDescriptor.iSerialNumber);
      this.configurations = await this.getConfigurations();
    } catch (error) {
      throw new Error(`initialize error: ${error}`);
    } finally {
      if (this.opened) {
        this.device.close();
      }
    }
  }
  decodeVersion(version) {
    const hex = `0000${version.toString(16)}`.slice(-4);
    return {
      major: parseInt(hex.substr(0, 2), undefined),
      minor: parseInt(hex.substr(2, 1), undefined),
      sub: parseInt(hex.substr(3, 1), undefined)
    };
  }
  async getStringDescriptor(index) {
    try {
      const buffer = await this.getStringDescriptorAsync(index);
      return buffer ? buffer.toString() : '';
    } catch (error) {
      return '';
    }
  }
  async getConfigurations() {
    const configs = [];
    for (const config of this.device.allConfigDescriptors) {
      const interfaces = [];
      for (const iface of config.interfaces) {
        const alternates = [];
        for (const alternate of iface) {
          const endpoints = [];
          for (const endpoint of alternate.endpoints) {
            endpoints.push({
              endpointNumber: endpoint.bEndpointAddress & ENDPOINT_NUMBER_MASK,
              direction: endpoint.bEndpointAddress & usb.LIBUSB_ENDPOINT_IN ? 'in' : 'out',
              type: (endpoint.bmAttributes & LIBUSB_TRANSFER_TYPE_MASK) === usb.LIBUSB_TRANSFER_TYPE_BULK ? 'bulk' : (endpoint.bmAttributes & LIBUSB_TRANSFER_TYPE_MASK) === usb.LIBUSB_TRANSFER_TYPE_INTERRUPT ? 'interrupt' : 'isochronous',
              packetSize: endpoint.wMaxPacketSize
            });
          }
          alternates.push({
            alternateSetting: alternate.bAlternateSetting,
            interfaceClass: alternate.bInterfaceClass,
            interfaceSubclass: alternate.bInterfaceSubClass,
            interfaceProtocol: alternate.bInterfaceProtocol,
            interfaceName: await this.getStringDescriptor(alternate.iInterface),
            endpoints
          });
        }
        const interfaceNumber = iface[0].bInterfaceNumber;
        const alternate = alternates.find(alt => alt.alternateSetting === this.device.interface(interfaceNumber).altSetting);
        if (alternate) {
          interfaces.push({
            interfaceNumber,
            alternate,
            alternates,
            claimed: false
          });
        }
      }
      configs.push({
        configurationValue: config.bConfigurationValue,
        configurationName: await this.getStringDescriptor(config.iConfiguration),
        interfaces
      });
    }
    return configs;
  }
  getEndpoint(address) {
    if (!this.device.interfaces) {
      return undefined;
    }
    for (const iface of this.device.interfaces) {
      const endpoint = iface.endpoint(address);
      if (endpoint) {
        return endpoint;
      }
    }
    return undefined;
  }
  controlTransferParamsToType(setup, direction) {
    const recipient = setup.recipient === 'device' ? usb.LIBUSB_RECIPIENT_DEVICE : setup.recipient === 'interface' ? usb.LIBUSB_RECIPIENT_INTERFACE : setup.recipient === 'endpoint' ? usb.LIBUSB_RECIPIENT_ENDPOINT : usb.LIBUSB_RECIPIENT_OTHER;
    const requestType = setup.requestType === 'standard' ? usb.LIBUSB_REQUEST_TYPE_STANDARD : setup.requestType === 'class' ? usb.LIBUSB_REQUEST_TYPE_CLASS : usb.LIBUSB_REQUEST_TYPE_VENDOR;
    return recipient | requestType | direction;
  }
  async _releaseInterface(interfaceNumber) {
    if (!this.opened) {
      throw new Error('releaseInterface error: invalid state');
    }
    if (!this.configuration) {
      throw new Error('releaseInterface error: interface not found');
    }
    const iface = this.configuration.interfaces.find(usbInterface => usbInterface.interfaceNumber === interfaceNumber);
    if (!iface) {
      throw new Error('releaseInterface error: interface not found');
    }
    if (!iface.claimed) {
      return;
    }
    try {
      const iface = this.device.interface(interfaceNumber);
      await iface.releaseAsync();
    } catch (error) {
      throw new Error(`releaseInterface error: ${error}`);
    }
  }
  checkDeviceOpen() {
    if (!this.opened) {
      throw new Error('The device must be opened first');
    }
  }
}
exports.WebUSBDevice = WebUSBDevice;

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = __dirname + "/native_modules/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
const {
  app,
  BrowserWindow,
  ipcMain
} = __webpack_require__(/*! electron */ "electron");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const usb = __webpack_require__(/*! usb */ "./node_modules/usb/dist/index.js");
if (__webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js")) {
  app.quit();
}
const webusb = new usb.WebUSB({
  allowAllDevices: true
});
const showDevices = async () => {
  const devices = await webusb.getDevices();
  const text = devices.map(d => `${d.vendorId}\t${d.productId}\t${d.serialNumber || '<no serial>'}`);
  text.unshift('VID\tPID\tSerial\n-------------------------------------');
  windows.forEach(win => {
    if (win) {
      win.webContents.send('devices', text.join('\n'));
    }
  });
};
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: '/Users/ruslanlukoanov/Desktop/www/Курсач/System/.webpack/renderer/main_window/preload.js',
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000/main_window');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  showDevices();
};
app.whenReady().then(() => {
  createWindow();
  webusb.addEventListener('connect', showDevices);
  webusb.addEventListener('disconnect', showDevices);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Читаем файлы в директории
  const files = fs.readdirSync(__dirname);
  console.log("Список файлов в текущей директории:", files);
});
app.on("window-all-closed", () => {
  webusb.removeEventListener('connect', showDevices);
  webusb.removeEventListener('disconnect', showDevices);
  if (process.platform !== "darwin") {
    app.quit();
  }
});
})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map