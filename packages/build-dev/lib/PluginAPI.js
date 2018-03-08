"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _assert = _interopRequireDefault(require("assert"));

var _winPath = _interopRequireDefault(require("./winPath"));

var _constants = require("./constants");

var _registerBabel = _interopRequireWildcard(require("./registerBabel"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 参考：
// https://github.com/vuejs/vue-cli/blob/next/packages/%40vue/cli-service/lib/PluginAPI.js
class PluginAPI {
  constructor(id, service) {
    this.id = id;
    this.service = service;
    this.utils = {
      winPath: _winPath.default,
      debug: (0, _debug.default)(`umi-plugin: ${id}`)
    };
    this.placeholder = {
      IMPORT: _constants.PLACEHOLDER_IMPORT,
      RENDER: _constants.PLACEHOLDER_RENDER,
      ROUTER_MODIFIER: _constants.PLACEHOLDER_ROUTER_MODIFIER,
      HISTORY_MODIFIER: _constants.PLACEHOLDER_HISTORY_MODIFIER
    };
  }

  register(key, fn) {
    if (!this.service.pluginMethods[key]) {
      this.service.pluginMethods[key] = [];
    }

    this.service.pluginMethods[key].push({
      fn
    });
  }

  modifyWebpackConfig(fn) {
    this.register('modifyWebpackConfig', fn);
  }

  registerBabel(files) {
    (0, _assert.default)(Array.isArray(files), `[PluginAPI] files for registerBabel must be Array, but got ${files}`);
    (0, _registerBabel.addBabelRegisterFiles)(files);
    (0, _registerBabel.default)(this.service.babel, {
      cwd: this.service.cwd
    });
  }

}

var _default = PluginAPI;
exports.default = _default;