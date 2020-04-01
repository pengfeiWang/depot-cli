"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _esprimaExtractComments = _interopRequireDefault(require("esprima-extract-comments"));

var _jsYaml = _interopRequireDefault(require("js-yaml"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('depot-build-dev:getYamlConfig');

function _default(code) {
  const comments = (0, _esprimaExtractComments.default)(code);
  return comments.slice(0, 1).filter(c => c.value.includes(':') && c.loc.start.line === 1).reduce((memo, item) => {
    const value = item.value;
    const v = value.replace(/^(\s+)?\*/gm, '');
    debug(v);

    try {
      const yamlResult = _jsYaml.default.safeLoad(v);

      return _objectSpread({}, memo, {}, yamlResult);
    } catch (e) {
      console.error(`yaml load failed: ${e}`);
    }

    return memo;
  }, {});
}