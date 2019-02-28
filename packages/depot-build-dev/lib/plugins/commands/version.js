"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = api => {
  api.registerCommand('version', {
    description: 'show related versions'
  }, args => {
    const pkg = require((0, _path.join)(process.env.DEPOT_DIR, 'package.json'));

    if (args.verbose) {
      const versions = api.applyPlugins('addVersionInfo', {
        initialValue: [`depot@${pkg.version}`, `${process.platform} ${process.arch}`, `node@${process.version}`, `depot-build-dev@${require('../../../package').version}`, `af-webpack@${require('af-webpack/package').version}`, `depot-babel-preset@${require('depot-babel-preset/package').version}`]
      });
      versions.forEach(version => {
        console.log(version);
      });
    } else {
      //console.log(pkg.version);
      console.log(`depot-cli: ${pkg.version}
platform: ${process.platform} ${process.arch}
node: ${process.version}
        `);
    }

    if ((0, _fs.existsSync)((0, _path.join)(process.env.DEPOT_DIR, '.local'))) {
      console.log(_chalk.default.cyan('@local'));
    }
  });
};

exports.default = _default;