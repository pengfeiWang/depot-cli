"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const yParser = require('yargs-parser');

const rollup = require('rollup');

const assert = require('assert');

const _require = require('fs'),
      existsSync = _require.existsSync,
      readdirSync = _require.readdirSync;

const _require2 = require('path'),
      join = _require2.join;

const nodeResolve = require('rollup-plugin-node-resolve');

const commonjs = require('rollup-plugin-commonjs');

const replace = require('rollup-plugin-replace');

const postcss = require('rollup-plugin-postcss');

const log = require('./utils/log');

const parseGlobals = require('./utils/parseGlobals');

const env = process.env.NODE_ENV;

function isLerna(cwd) {
  return existsSync(join(cwd, 'lerna.json'));
}

function build(dir, opts = {}) {
  const cwd = opts.cwd,
        watch = opts.watch,
        _opts$globals = opts.globals,
        globals = _opts$globals === void 0 ? {} : _opts$globals;
  assert(dir.charAt(0) !== '/', `dir should be relative`);
  assert(cwd, `opts.cwd should be supplied`);
  const pkgPath = join(cwd, dir, 'package.json');
  assert(existsSync(pkgPath), 'package.json should exists');
  const inputOptions = {
    external: ['react', 'react-dom', ...Object.keys(globals)],
    plugins: [nodeResolve({
      jsnext: true
    }), replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }), commonjs(), postcss({
      extract: true
    })]
  };
  const outputOptions = {
    format: 'umd',
    extend: true,
    globals: _objectSpread({
      'react': 'React',
      'react-dom': 'ReactDOM'
    }, globals)
  };

  const pkg = require(pkgPath);

  const _ref = pkg.depotTools || {},
        _ref$rollupFiles = _ref.rollupFiles,
        rollupFiles = _ref$rollupFiles === void 0 ? [] : _ref$rollupFiles;

  _asyncToGenerator(function* () {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = rollupFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let rollupFile = _step.value;

        const _rollupFile = _slicedToArray(rollupFile, 2),
              file = _rollupFile[0],
              _rollupFile$ = _rollupFile[1],
              opts = _rollupFile$ === void 0 ? {} : _rollupFile$;

        log.info(`build ${file}`);

        const input = _objectSpread({}, inputOptions, {
          input: join(dir, file)
        });

        const output = _objectSpread({}, outputOptions, {
          file: join(dir, file.replace(/\.js$/, '.umd.js')),
          name: opts.name
        });

        if (watch) {
          const watcher = rollup.watch(_objectSpread({}, input, {
            output
          }));
          watcher.on('event', event => {
            log.info(`watch ${event.code}`);
          });
        } else {
          const bundle = yield rollup.rollup(input);
          yield bundle.write(output);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  })();
} // Init


const cwd = process.cwd();
const args = yParser(process.argv.slice(3));
const watch = args.w || args.watch;
const globals = parseGlobals(args.g || args.globals || '');

if (isLerna(cwd)) {
  const dirs = readdirSync(join(cwd, 'packages'));
  dirs.forEach(pkg => {
    if (pkg.charAt(0) === '.') return;
    build(`./packages/${pkg}`, {
      cwd,
      watch,
      globals
    });
  });
} else {
  build('./', {
    cwd,
    watch,
    globals
  });
}