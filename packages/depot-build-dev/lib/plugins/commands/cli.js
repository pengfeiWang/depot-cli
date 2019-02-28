"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chalk = _interopRequireDefault(require("chalk"));

var _depotUtils = require("depot-utils");

var _path = require("path");

var _fsExtra = require("fs-extra");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import yParser from 'yargs-parser';
// import { copyFileSync, unlinkSync, existsSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
function _default(api) {
  const script = process.argv[2];
  const directory = process.argv[3];

  function error(message) {
    console.error(_chalk.default.red(`ERROR: ${message}`));
  }

  function success(message) {
    console.log(_chalk.default.green(message));
  }

  function printFileName(f) {
    (0, _fsExtra.readdirSync)(f).forEach(file => {
      if (file === '.DS_Store') {
        (0, _fsExtra.removeSync)((0, _depotUtils.winPath)((0, _path.join)(directory, file)));
      } else {
        const filePath = (0, _depotUtils.winPath)((0, _path.join)(f, file));
        const stats = (0, _fsExtra.statSync)(filePath);

        if (stats.isDirectory()) {
          console.log(_chalk.default.bold.green('  Create'), ' ', `${f}/${file}`);
          printFileName(filePath);
          return;
        } else {
          console.log(_chalk.default.bold.green('  Create'), ' ', `${f}/${file}`);
        }
      }
    });
  }

  api.registerCommand('cli', {
    description: '[alpha] update config via cli',
    options: {}
  }, () => {
    if (!directory) {
      error('not input directory');
      process.exit(1);
    }

    if ((0, _fsExtra.existsSync)(directory)) {
      error('The directory already exists');
      process.exit(1);
    }

    console.log(_chalk.default.green(`Commands: cli `));
    console.log(_chalk.default.green(`  Create directory [${directory}]`));
    (0, _fsExtra.copySync)((0, _depotUtils.winPath)((0, _path.join)(__dirname, '../../../template/cli-template')), directory);
    (0, _fsExtra.removeSync)((0, _depotUtils.winPath)((0, _path.join)(directory, '.DS_Store')));
    (0, _fsExtra.readdirSync)(directory).forEach(file => {
      const filePath = (0, _depotUtils.winPath)((0, _path.join)(directory, file));
      const stats = (0, _fsExtra.statSync)(filePath);

      if (file === '.DS_Store') {
        (0, _fsExtra.removeSync)((0, _depotUtils.winPath)((0, _path.join)(directory, file)));
      } else {
        console.log(_chalk.default.bold.green('  Create'), ' ', file);

        if (stats.isDirectory()) {
          printFileName(filePath);
          return;
        }
      }
    });
    success(`
Success!

Inside that directory, you can run several commands:
  * npm start: Starts the development server.
  * npm run build: Bundles the app into dist for production.


We suggest that you begin by typing:
  ${_chalk.default.blue.bold(`cd ${directory}`)}
  ${_chalk.default.blue.bold('npm install && npm start')}`);
  });
}