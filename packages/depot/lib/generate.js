"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _assert = _interopRequireDefault(require("assert"));

var _page = _interopRequireDefault(require("./generators/page"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const generators = {
  page: _page.default
};

function _default(opts = {}) {
  const type = opts.type,
        file = opts.file;
  (0, _assert.default)(type, 'opts.type should be supplied');
  (0, _assert.default)(typeof type === 'string', 'opts.file should be string');
  (0, _assert.default)(file, 'opts.file should be supplied');
  (0, _assert.default)(typeof file === 'string', 'opts.file should be string');
  (0, _assert.default)(generators[type], `generator of type (${type}) not found`);
  delete opts.type;
  generators[type](opts);
}