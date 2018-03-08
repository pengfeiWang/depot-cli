"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _assert = _interopRequireDefault(require("assert"));

var _path = require("path");

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api) {
  return {
    name: 'loading',

    validate(val) {
      (0, _assert.default)(typeof val === 'string', `Configure item loading should be string, but got ${val}.`);
      const cwd = api.service.paths.cwd;
      (0, _assert.default)((0, _fs.existsSync)((0, _path.join)(cwd, val)) || (0, _fs.existsSync)((0, _path.join)(cwd, `${val}.js`)) || (0, _fs.existsSync)((0, _path.join)(cwd, `${val}.jsx`)) || (0, _fs.existsSync)((0, _path.join)(cwd, `${val}.ts`)) || (0, _fs.existsSync)((0, _path.join)(cwd, `${val}.tsx`)), `File ${val} of configure item loading not found.`);
    },

    onChange() {}

  };
}