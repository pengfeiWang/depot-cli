"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _getConfig = _interopRequireDefault(require("af-webpack/getConfig"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import path, { join } from 'path';
// import { winPath } from 'depot-utils';
function _default(service) {
  const config = service.config;
  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd
    }
  });
  (0, _assert.default)(!('chainConfig' in afWebpackOpts), `chainConfig should not supplied in modifyAFWebpackOpts`);

  afWebpackOpts.chainConfig = webpackConfig => {
    service.applyPlugins('chainWebpackConfig', {
      args: webpackConfig // dva: require('dva').default

    });

    if (config.chainWebpack) {
      config.chainWebpack(webpackConfig, {
        webpack: require('af-webpack/webpack')
      });
    }
  }; // console.log('getConfig(afWebpackOpts)::', getConfig(afWebpackOpts));
  // afWebpackOpts.alias.dva = require('dva');


  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: (0, _getConfig.default)(afWebpackOpts)
  });
}