"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = api => {
  const paths = api.paths,
        config = api.config;
  const absTemplatePath = (0, _path.join)(__dirname, '../template/generators');
  return class Generator extends api.Generator {
    writing() {
      if (config.routes) {
        throw new Error(`depot g page does not work when config.routes exists`);
      }

      const models = config.singular ? 'model' : 'models';
      const name = this.args[0].toString();
      (0, _assert.default)(!name.includes('/'), `model name should not contains /, bug got ${name}`);
      this.fs.copyTpl((0, _path.join)(absTemplatePath, 'model.js'), (0, _path.join)(paths.absSrcPath, models, `${name}.js`), {
        name
      });
    }

  };
};

exports.default = _default;