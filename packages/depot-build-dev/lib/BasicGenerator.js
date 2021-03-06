"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _yeomanGenerator = _interopRequireDefault(require("yeoman-generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _require = require('fs'),
      existsSync = _require.existsSync;

const _require2 = require('path'),
      join = _require2.join;

class BasicGenerator extends _yeomanGenerator.default {
  constructor(args, opts) {
    super(args, opts);
    this.isTypeScript = existsSync(join(opts.env.cwd, 'tsconfig.json'));
  }

}

var _default = BasicGenerator;
exports.default = _default;