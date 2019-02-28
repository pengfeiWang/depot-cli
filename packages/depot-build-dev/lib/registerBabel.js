"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addBabelRegisterFiles = addBabelRegisterFiles;
exports.default = _default;

var _path = require("path");

var _registerBabel = _interopRequireDefault(require("af-webpack/registerBabel"));

var _lodash = require("lodash");

var _depotUtils = require("depot-utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let files = null;

function initFiles() {
  if (files) return;
  const env = process.env.DEPOT_ENV;
  files = [...(0, _lodash.flatten)(_constants.CONFIG_FILES.concat('config/').map(file => [file, ...(env ? [file.replace(/\.js$/, `.${env}.js`)] : []), file.replace(/\.js$/, `.local.js`)]))];
}

function addBabelRegisterFiles(extraFiles) {
  initFiles();
  files.push(...extraFiles);
}

function _default(opts = {}) {
  initFiles();
  const cwd = opts.cwd;
  const only = files.map(f => {
    const fullPath = (0, _path.isAbsolute)(f) ? f : (0, _path.join)(cwd, f);
    return (0, _depotUtils.winPath)(fullPath);
  });
  (0, _registerBabel.default)({
    // only suport glob
    // ref: https://babeljs.io/docs/en/next/babel-core.html#configitem-type
    only,
    babelPreset: [require.resolve('depot-babel-preset'), {
      transformRuntime: false
    }]
  });
}