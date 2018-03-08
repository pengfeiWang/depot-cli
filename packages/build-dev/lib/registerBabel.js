"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addBabelRegisterFiles = addBabelRegisterFiles;
exports.default = _default;

var _path = require("path");

var _pathIsAbsolute = _interopRequireDefault(require("path-is-absolute"));

var _registerBabel = _interopRequireDefault(require("af-webpack/registerBabel"));

var _constants = require("./constants");

var _winPath = _interopRequireDefault(require("./winPath"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const files = [..._constants.CONFIG_FILES, 'webpack.config.js', '.webpackrc.js'];

function addBabelRegisterFiles(extraFiles) {
  files.push(...extraFiles);
}

function _default(babelPreset, opts = {}) {
  const cwd = opts.cwd;
  const only = files.map(f => {
    const fullPath = (0, _pathIsAbsolute.default)(f) ? f : (0, _path.join)(cwd, f);
    return (0, _winPath.default)(fullPath);
  });
  (0, _registerBabel.default)({
    only: [only.join('|')],
    babelPreset: [babelPreset, {
      disableTransform: true
    }]
  });
}