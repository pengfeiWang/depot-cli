'use strict';

var _slash = _interopRequireDefault(require('slash'));

var _mkdirp = require('mkdirp');

var _path = require('path');

var _fs = require('fs');

var _chalk = _interopRequireDefault(require('chalk'));

var _fsExtra = require('fs-extra');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// import fork from '../../../build-dev/lib/fork';
// fork(require.resolve('./realDev.js'));
function winPath(path) {
  return (0, _slash.default)(path);
}

function error(message) {
  console.error(_chalk.default.red(message));
}

function success(message) {
  console.error(_chalk.default.green(message));
}

const cwd = process.cwd();

if (!process.argv[2]) {
  error('not input  directory');
  process.exit(1);
}

const directory = winPath((0, _path.join)(cwd, process.argv[2]));
const relativeDirectory = (0, _path.relative)(cwd, directory);

function printFileName(f) {
  (0, _fs.readdirSync)(f).forEach(file => {
    if (file === '.DS_Store') {
      (0, _fsExtra.removeSync)(winPath((0, _path.join)(directory, file)));
    } else {
      const filePath = winPath((0, _path.join)(f, file));
      const stats = (0, _fs.statSync)(filePath);

      if (stats.isDirectory()) {
        console.log(_chalk.default.bold.green('  Create'), ' ', `${f}/${file}`);
        printFileName(filePath);
      } else {
        console.log(_chalk.default.bold.green('  Create'), ' ', `${f}/${file}`);
      }
    }
  });
}

if ((0, _fs.existsSync)(directory)) {
  error('The directory already exists');
  process.exit(1);
}

console.log(_chalk.default.green(`Commands: cli `));
console.log(_chalk.default.green(`  Create: ${directory}`));
(0, _fsExtra.copySync)(
  winPath((0, _path.join)(__dirname, '../../template')),
  directory,
);
(0, _fsExtra.removeSync)(winPath((0, _path.join)(directory, '.DS_Store')));
(0, _fs.readdirSync)(directory).forEach(file => {
  const filePath = winPath((0, _path.join)(directory, file));
  const stats = (0, _fs.statSync)(filePath);

  if (file === '.DS_Store') {
    (0, _fsExtra.removeSync)(winPath((0, _path.join)(directory, file)));
  } else {
    console.log(_chalk.default.bold.green('  Create'), ' ', file);

    if (stats.isDirectory()) {
      printFileName(filePath);
    }
  }
});
console.log(_chalk.default.green(`  Create End`));
success(`
Success!

Inside that directory, you can run several commands:
  * npm start: Starts the development server.
  * npm run build: Bundles the app into dist for production.


We suggest that you begin by typing:
  ${_chalk.default.blue.bold(`cd ${directory}`)}
  ${_chalk.default.blue.bold('npm install && npm start')}`);
