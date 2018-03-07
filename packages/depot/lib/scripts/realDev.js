'use strict';

var _yargsParser = _interopRequireDefault(require('yargs-parser'));

var _dev = _interopRequireDefault(require('../dev'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const argv = (0, _yargsParser.default)(process.argv.slice(2)); // 修复 Ctrl+C 时 dev server 没有正常退出的问题

process.on('SIGINT', () => {
  process.exit(1);
});
(0, _dev.default)({
  plugins: argv.plugins ? argv.plugins.split(',') : [],
});
