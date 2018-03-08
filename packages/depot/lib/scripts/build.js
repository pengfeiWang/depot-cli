"use strict";

var _chalk = _interopRequireDefault(require("chalk"));

var _yargsParser = _interopRequireDefault(require("yargs-parser"));

var _build = _interopRequireDefault(require("../build"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (0, _yargsParser.default)(process.argv.slice(2));
(0, _build.default)({
  plugins: argv.plugins ? argv.plugins.split(',') : []
}).catch(e => {
  console.error(_chalk.default.red(`Build failed: ${e.message}`));
  console.log(e);
});