'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

var _path = require('path');

var _fs = require('fs');

var _chalk = _interopRequireDefault(require('chalk'));

var _assert = _interopRequireDefault(require('assert'));

var _bodyParser = _interopRequireDefault(require('body-parser'));

var _chokidar = _interopRequireDefault(require('chokidar'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function MOCK_START(req, res, next) {
  next();
}

function MOCK_END(req, res, next) {
  next();
}

class HttpMock {
  constructor({ cwd, devServer, api }) {
    this.devServer = devServer;
    this.api = api;
    this.absMockPath = (0, _path.join)(cwd, 'mock');
    this.configPath = (0, _path.join)(cwd, '.umirc.mock.js');
    this.api.registerBabel([this.configPath, this.absMockPath]);
    this.applyMock();
    this.watch();
  }

  applyMock() {
    try {
      this.realApplyMock();
    } catch (e) {
      console.error(_chalk.default.red(`mock failed: ${e.message}`));
    }
  }

  watch() {
    const devServer = this.devServer,
      debug = this.api.utils.debug;

    const watcher = _chokidar.default.watch(
      [this.configPath, this.absMockPath],
      {
        ignoreInitial: true,
      },
    );

    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}`);
      this.deleteRoutes();
      this.applyMock();
    });
  }
  /**
   * Delete from MOCK_START to MOCK_END
   */

  deleteRoutes() {
    const devServer = this.devServer,
      debug = this.api.utils.debug;
    const app = devServer.app;
    let startIndex = null;
    let endIndex = null;

    app._router.stack.forEach((item, index) => {
      if (item.name === 'MOCK_START') startIndex = index;
      if (item.name === 'MOCK_END') endIndex = index;
    });

    if (startIndex !== null && endIndex !== null) {
      app._router.stack.splice(startIndex, endIndex - startIndex + 1);
    }

    debug(
      `routes after changed: ${app._router.stack
        .map(item => item.name || 'undefined name')
        .join(', ')}`,
    );
  }

  realApplyMock() {
    const debug = this.api.utils.debug;
    const config = this.getConfig();
    debug(`config: ${JSON.stringify(config)}`);
    const devServer = this.devServer;
    const app = devServer.app;
    devServer.use(MOCK_START);
    devServer.use(
      _bodyParser.default.json({
        limit: '5mb',
        strict: false,
      }),
    );
    devServer.use(
      _bodyParser.default.urlencoded({
        extended: true,
        limit: '5mb',
      }),
    );
    Object.keys(config).forEach(key => {
      const keyParsed = this.parseKey(key);
      (0, _assert.default)(
        !!app[keyParsed.method],
        `method of ${key} is not valid`,
      );
      (0, _assert.default)(
        typeof config[key] === 'function' || typeof config[key] === 'object',
        `mock value of ${key} should be function or object, but got ${typeof config[
          key
        ]}`,
      );
      app[keyParsed.method](
        keyParsed.path,
        this.createMockHandler(keyParsed.method, keyParsed.path, config[key]),
      );
    });
    devServer.use(MOCK_END); // 调整 stack，把 UMI_PLUGIN_404 放到最后

    let umiPlugin404Index = null;
    let endIndex = null;

    app._router.stack.forEach((item, index) => {
      if (item.name === 'UMI_PLUGIN_404') umiPlugin404Index = index;
      if (item.name === 'MOCK_END') endIndex = index;
    });

    if (
      umiPlugin404Index !== null &&
      endIndex !== null &&
      umiPlugin404Index < endIndex
    ) {
      const umiPlugin404Middleware = app._router.stack.splice(
        umiPlugin404Index,
        1,
      );

      app._router.stack.push(umiPlugin404Middleware[0]);
    }

    debug(
      `routes after resort: ${app._router.stack
        .map(item => item.name || 'undefined name')
        .join(', ')}`,
    );
  }

  createMockHandler(method, path, value) {
    return function mockHandler(...args) {
      const res = args[1];

      if (typeof value === 'function') {
        value(...args);
      } else {
        res.json(value);
      }
    };
  }

  parseKey(key) {
    let method = 'get';
    let path = key;

    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ');
      method = splited[0].toLowerCase();
      path = splited[1]; // eslint-disable-line
    }

    return {
      method,
      path,
    };
  }

  getConfig() {
    if ((0, _fs.existsSync)(this.configPath)) {
      // disable require cache
      Object.keys(require.cache).forEach(file => {
        if (file === this.configPath || file.indexOf(this.absMockPath) > -1) {
          delete require.cache[file];
        }
      });
      return require(this.configPath); // eslint-disable-line
    } else {
      return {};
    }
  }
}

var _default = HttpMock;
exports.default = _default;
