"use strict";

var _yargsParser = _interopRequireDefault(require("yargs-parser"));

var _generate = _interopRequireDefault(require("../generate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const argv = (0, _yargsParser.default)(process.argv.slice(2));

const _argv$_ = _slicedToArray(argv._, 2),
      type = _argv$_[0],
      file = _argv$_[1];

(0, _generate.default)({
  type,
  file,
  useClass: argv.c || argv.class || false,
  isDirectory: argv.d || argv.directory || false
});