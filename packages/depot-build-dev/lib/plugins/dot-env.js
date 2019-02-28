"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _chokidar = _interopRequireDefault(require("chokidar"));

var _path = require("path");

var _fs = require("fs");

var _signale = _interopRequireDefault(require("signale"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api) {
  const debug = api.debug,
        paths = api.paths;
  const cwd = paths.cwd;

  function watch() {
    if (process.env.WATCH_FILES === 'none') return;
    let fileName = '.env';
    let cfgFile = (0, _path.join)(cwd, fileName);

    if (!(0, _fs.existsSync)(cfgFile)) {
      return;
    }

    const watcher = _chokidar.default.watch([(0, _path.join)(cwd, fileName)], {
      ignoreInitial: true
    });

    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, load error`);

      _signale.default.success(`${fileName} parse success`);

      api.restart();
    });
  }

  api.onDevCompileDone(() => {
    if (process.env.NODE_ENV === 'development') {
      watch();
    }
  });
}