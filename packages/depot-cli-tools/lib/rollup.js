function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError('Invalid attempt to destructure non-iterable instance');
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === '[object Arguments]'
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

var yParser = require('yargs-parser');

var rollup = require('rollup');

var assert = require('assert');

var _require = require('fs'),
  existsSync = _require.existsSync,
  readdirSync = _require.readdirSync;

var _require2 = require('path'),
  join = _require2.join;

var nodeResolve = require('rollup-plugin-node-resolve');

var commonjs = require('rollup-plugin-commonjs');

var replace = require('rollup-plugin-replace');

var postcss = require('rollup-plugin-postcss');

var log = require('./utils/log');

var parseGlobals = require('./utils/parseGlobals');

var env = process.env.NODE_ENV;

function isLerna(cwd) {
  return existsSync(join(cwd, 'lerna.json'));
}

function build(dir) {
  var opts =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cwd = opts.cwd,
    watch = opts.watch,
    _opts$globals = opts.globals,
    globals = _opts$globals === void 0 ? {} : _opts$globals;
  assert(dir.charAt(0) !== '/', 'dir should be relative');
  assert(cwd, 'opts.cwd should be supplied');
  var pkgPath = join(cwd, dir, 'package.json');
  assert(existsSync(pkgPath), 'package.json should exists');
  var inputOptions = {
    external: ['react', 'react-dom'].concat(
      _toConsumableArray(Object.keys(globals)),
    ),
    plugins: [
      nodeResolve({
        jsnext: true,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      commonjs(),
      postcss({
        extract: true,
      }),
    ],
  };
  var outputOptions = {
    format: 'umd',
    extend: true,
    globals: _objectSpread(
      {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      globals,
    ),
  };

  var pkg = require(pkgPath);

  var _ref = pkg.depotTools || {},
    _ref$rollupFiles = _ref.rollupFiles,
    rollupFiles = _ref$rollupFiles === void 0 ? [] : _ref$rollupFiles;

  _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var _iteratorNormalCompletion,
        _didIteratorError,
        _iteratorError,
        _iterator,
        _step,
        rollupFile,
        _rollupFile,
        file,
        _rollupFile$,
        _opts,
        input,
        output,
        watcher,
        bundle;

      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 3;
                _iterator = rollupFiles[Symbol.iterator]();

              case 5:
                if (
                  (_iteratorNormalCompletion = (_step = _iterator.next()).done)
                ) {
                  _context.next = 24;
                  break;
                }

                rollupFile = _step.value;
                (_rollupFile = _slicedToArray(rollupFile, 2)),
                  (file = _rollupFile[0]),
                  (_rollupFile$ = _rollupFile[1]),
                  (_opts = _rollupFile$ === void 0 ? {} : _rollupFile$);
                log.info('build '.concat(file));
                input = _objectSpread({}, inputOptions, {
                  input: join(dir, file),
                });
                output = _objectSpread({}, outputOptions, {
                  file: join(dir, file.replace(/\.js$/, '.umd.js')),
                  name: _opts.name,
                });

                if (!watch) {
                  _context.next = 16;
                  break;
                }

                watcher = rollup.watch(
                  _objectSpread({}, input, {
                    output: output,
                  }),
                );
                watcher.on('event', function(event) {
                  log.info('watch '.concat(event.code));
                });
                _context.next = 21;
                break;

              case 16:
                _context.next = 18;
                return rollup.rollup(input);

              case 18:
                bundle = _context.sent;
                _context.next = 21;
                return bundle.write(output);

              case 21:
                _iteratorNormalCompletion = true;
                _context.next = 5;
                break;

              case 24:
                _context.next = 30;
                break;

              case 26:
                _context.prev = 26;
                _context.t0 = _context['catch'](3);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 30:
                _context.prev = 30;
                _context.prev = 31;

                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }

              case 33:
                _context.prev = 33;

                if (!_didIteratorError) {
                  _context.next = 36;
                  break;
                }

                throw _iteratorError;

              case 36:
                return _context.finish(33);

              case 37:
                return _context.finish(30);

              case 38:
              case 'end':
                return _context.stop();
            }
          }
        },
        _callee,
        null,
        [[3, 26, 30, 38], [31, , 33, 37]],
      );
    }),
  )();
} // Init

var cwd = process.cwd();
var args = yParser(process.argv.slice(3));
var watch = args.w || args.watch;
var globals = parseGlobals(args.g || args.globals || '');

if (isLerna(cwd)) {
  var dirs = readdirSync(join(cwd, 'packages'));
  dirs.forEach(function(pkg) {
    if (pkg.charAt(0) === '.') return;
    build('./packages/'.concat(pkg), {
      cwd: cwd,
      watch: watch,
      globals: globals,
    });
  });
} else {
  build('./', {
    cwd: cwd,
    watch: watch,
    globals: globals,
  });
}
