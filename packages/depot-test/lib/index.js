"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _jest = _interopRequireDefault(require("jest"));

var _args = require("jest-cli/build/cli/args");

var _path = require("path");

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('depot-test');

process.env.NODE_ENV = 'test';

function _default(originOpts = {}) {
  const opts = _objectSpread({}, originOpts);

  const _opts$cwd = opts.cwd,
        cwd = _opts$cwd === void 0 ? process.cwd() : _opts$cwd,
        moduleNameMapper = opts.moduleNameMapper;
  let transformInclude = opts.transformInclude || [];

  if (typeof transformInclude === 'string') {
    transformInclude = [transformInclude];
  }

  const jestConfigFile = (0, _path.join)(cwd, 'jest.config.js');
  let userJestConfig = {};

  if ((0, _fs.existsSync)(jestConfigFile)) {
    userJestConfig = require(jestConfigFile); // eslint-disable-line
  }

  const _userJestConfig = userJestConfig,
        userModuleNameMapper = _userJestConfig.moduleNameMapper,
        extraSetupFiles = _userJestConfig.extraSetupFiles,
        restUserJestConfig = _objectWithoutProperties(_userJestConfig, ["moduleNameMapper", "extraSetupFiles"]);

  const config = _objectSpread({
    rootDir: process.cwd(),
    setupFiles: [require.resolve('./shim.js'), require.resolve('./setupTests.js'), ...(extraSetupFiles || [])],
    resolver: require.resolve('jest-pnp-resolver'),
    transform: {
      '\\.(t|j)sx?$': require.resolve('./transformers/jsTransformer'),
      '\\.svg$': require.resolve('./transformers/fileTransformer')
    },
    transformIgnorePatterns: [`node_modules/(?!([^/]*?enzyme-adapter-react-16|${transformInclude.join('|')})/)`],
    testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    setupFilesAfterEnv: [require.resolve('./jasmine')],
    moduleNameMapper: _objectSpread({
      '\\.(css|less|sass|scss)$': require.resolve('identity-obj-proxy'),
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve('./fileMock.js')
    }, moduleNameMapper || {}, {}, userModuleNameMapper || {}),
    testPathIgnorePatterns: ['/node_modules/']
  }, restUserJestConfig || {});

  delete opts.transformInclude; // Convert alias option into real one

  Object.keys(_args.options).forEach(name => {
    const _ref = _args.options[name] || {},
          alias = _ref.alias;

    if (alias && opts[alias]) {
      opts[name] = opts[alias];
      delete opts[alias];
    }
  });
  return new Promise((resolve, reject) => {
    _jest.default.runCLI(_objectSpread({
      config: JSON.stringify(config)
    }, opts), [cwd]).then(result => {
      debug(result);
      const results = result.results;

      if (results.success) {
        resolve();
      } else {
        reject(new Error('Jest failed'));
      }
    }).catch(e => {
      console.log(e);
    });
  });
}