"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rimraf = require("rimraf");

var _fs = require("fs");

var _path = require("path");

var _getUserConfig = _interopRequireWildcard(require("af-webpack/getUserConfig"));

var _reactDevUtils = require("af-webpack/react-dev-utils");

var _chalk = _interopRequireDefault(require("chalk"));

var _getPaths = _interopRequireDefault(require("./getPaths"));

var _getRouteConfig = _interopRequireDefault(require("./getRouteConfig"));

var _registerBabel = _interopRequireDefault(require("./registerBabel"));

var _watch = require("./getConfig/watch");

var _UserConfig = _interopRequireDefault(require("./UserConfig"));

var _getPlugins = _interopRequireDefault(require("./getPlugins"));

var _getWebpackConfig = _interopRequireDefault(require("./getWebpackConfig"));

var _chunksToMap = _interopRequireDefault(require("./utils/chunksToMap"));

var _send = _interopRequireWildcard(require("./send"));

var _FilesGenerator = _interopRequireDefault(require("./FilesGenerator"));

var _HtmlGenerator = _interopRequireDefault(require("./HtmlGenerator"));

var _createRouteMiddleware = _interopRequireDefault(require("./createRouteMiddleware"));

var _PluginAPI = _interopRequireDefault(require("./PluginAPI"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const debug = require('debug')(`${_constants.LIBRARY_NAME} dev: Service`);

class Service {
  constructor(cwd, {
    plugins: pluginFiles,
    babel,
    entryJSTpl,
    routerTpl,
    hash,
    preact,
    extraResolveModules,
    libraryName = _constants.LIBRARY_NAME,
    staticDirectory = 'static',
    tmpDirectory = `.${_constants.LIBRARY_NAME}`,
    outputPath = './dist'
  }) {
    Object.defineProperty(this, "reload", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: () => {
        if (!this.devServer) return;
        this.devServer.sockWrite(this.devServer.sockets, 'content-changed');
      }
    });
    Object.defineProperty(this, "printWarn", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: messages => {
        if (!this.devServer) return;
        messages = typeof messages === 'string' ? [messages] : messages;
        this.devServer.sockWrite(this.devServer.sockets, 'warns', messages);
      }
    });
    Object.defineProperty(this, "printError", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: messages => {
        if (!this.devServer) return;
        messages = typeof messages === 'string' ? [messages] : messages;
        this.devServer.sockWrite(this.devServer.sockets, 'errors', messages);
      }
    });
    Object.defineProperty(this, "restart", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: why => {
        if (!this.devServer) return;
        (0, _reactDevUtils.clearConsole)();
        console.log(_chalk.default.green(`Since ${why}, try to restart server`));
        (0, _watch.unwatch)();
        this.devServer.close();
        process.send({
          type: 'RESTART'
        });
      }
    });
    this.cwd = cwd || process.cwd();
    this.pluginFiles = pluginFiles;
    this.babel = babel;
    this.entryJSTpl = entryJSTpl;
    this.routerTpl = routerTpl;
    this.hash = hash;
    this.preact = preact;
    this.extraResolveModules = extraResolveModules;
    this.libraryName = libraryName;
    this.staticDirectory = staticDirectory;
    this.tmpDirectory = tmpDirectory;
    this.outputPath = outputPath;
    this.paths = (0, _getPaths.default)(this);
    this.pluginMethods = {};
    (0, _registerBabel.default)(this.babel, {
      cwd: this.cwd
    });
  }

  setRoutes(routes) {
    this.routes = routes;
  }

  getWebpackRCConfig() {
    return (0, _getUserConfig.default)({
      cwd: this.cwd,
      disabledConfigs: ['entry', 'outputPath', 'hash']
    });
  }

  dev() {
    // 获取用户 config.js 配置
    const userConfig = new _UserConfig.default(this);

    try {
      this.config = userConfig.getConfig({
        force: true
      });
    } catch (e) {
      console.error(_chalk.default.red(e.message));
      debug('Get config failed, watch config and reload'); // 监听配置项变更，然后重新执行 dev 逻辑

      userConfig.watchConfigs((event, path) => {
        debug(`[${event}] ${path}, unwatch and reload`); // 重新执行 dev 逻辑

        userConfig.unwatch();
        this.dev();
      });
      return;
    }

    this.initPlugins(); // 获取 .webpackrc 配置

    let returnedWatchWebpackRCConfig = null;

    try {
      const configObj = this.getWebpackRCConfig();
      this.webpackRCConfig = configObj.config;
      returnedWatchWebpackRCConfig = configObj.watch;
    } catch (e) {
      console.error(_chalk.default.red(e.message));
      debug('Get .webpackrc config failed, watch config and reload'); // 监听配置项变更，然后重新执行 dev 逻辑

      (0, _getUserConfig.watchConfigs)().on('all', (event, path) => {
        debug(`[${event}] ${path}, unwatch and reload`); // 重新执行 dev 逻辑

        (0, _getUserConfig.unwatchConfigs)();
        this.dev();
      });
      return;
    }

    this.applyPlugins('onStart');
    this.initRoutes(); // 生成入口文件

    const filesGenerator = new _FilesGenerator.default(this);

    try {
      filesGenerator.generate({
        onChange: () => {
          this.sendPageList();
        }
      });
    } catch (e) {
      console.error(_chalk.default.red(e.message));
      console.error(_chalk.default.red(e.stack));
      debug('Generate entry failed, watch pages and reload');
      filesGenerator.watch({
        onChange: () => {
          filesGenerator.unwatch();
          this.dev();
        }
      });
      return;
    }

    const webpackConfig = (0, _getWebpackConfig.default)(this);
    this.webpackConfig = webpackConfig;
    const extraMiddlewares = this.applyPlugins('modifyMiddlewares', {
      initialValue: [(0, _createRouteMiddleware.default)(this, {
        rebuildEntry() {
          filesGenerator.rebuild();
        }

      })]
    }); // return;

    require('af-webpack/dev').default({
      // eslint-disable-line
      webpackConfig,
      extraMiddlewares,
      beforeServer: devServer => {
        this.applyPlugins('beforeServer', {
          args: {
            devServer
          }
        });
      },
      afterServer: devServer => {
        this.devServer = devServer;
        this.applyPlugins('afterServer', {
          args: {
            devServer
          }
        });
        returnedWatchWebpackRCConfig(devServer);
        userConfig.setConfig(this.config);
        userConfig.watchWithDevServer();
        filesGenerator.watch();
      },
      onCompileDone: stats => {
        this.applyPlugins('onCompileDone', {
          args: {
            stats
          }
        });
      },
      proxy: this.webpackRCConfig.proxy || {},
      // 支付宝 IDE 里不自动打开浏览器
      openBrowser: !process.env.ALIPAY_EDITOR,
      historyApiFallback: false
    });
  }

  initRoutes() {
    this.routes = this.applyPlugins('modifyRoutes', {
      initialValue: (0, _getRouteConfig.default)(this.paths, this.config)
    });
  }

  initPlugins() {
    const config = _UserConfig.default.getConfig({
      cwd: this.cwd
    });

    debug(`user config: ${JSON.stringify(config)}`);
    this.plugins = (0, _getPlugins.default)({
      configPlugins: config.plugins || [],
      pluginsFromOpts: this.pluginFiles,
      cwd: this.cwd,
      babel: this.babel
    });
    this.config = config;
    debug(`plugins: ${this.plugins.map(p => p.id).join(' | ')}`);
    this.plugins.forEach(({
      id,
      apply,
      opts
    }) => {
      try {
        apply(new _PluginAPI.default(id, this), opts);
      } catch (e) {
        console.error(_chalk.default.red(`Plugin ${id} initialize failed, ${e.message}`));
        console.error(e);
        process.exit(1);
      }
    });
  }

  applyPlugins(key, opts = {}) {
    return (this.pluginMethods[key] || []).reduce((memo, {
      fn
    }) => {
      try {
        return fn({
          memo,
          args: opts.args
        });
      } catch (e) {
        console.error(_chalk.default.red(`Plugin apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }

  sendPageList() {
    const pageList = this.routes.map(route => {
      return {
        path: route.path
      };
    });
    (0, _send.default)({
      type: _send.PAGE_LIST,
      payload: pageList
    });
  }

  build() {
    const userConfig = new _UserConfig.default(this);
    this.config = userConfig.getConfig();
    this.initPlugins();
    this.webpackRCConfig = this.getWebpackRCConfig().config;
    this.applyPlugins('onStart');
    this.initRoutes();
    debug(`Clean tmp dir ${this.paths.tmpDirPath}`); // rimraf(this.paths.absTmpDirPath);

    debug(`Clean output path ${this.paths.outputPath}`); // rimraf(this.paths.absOutputPath);

    debug('Generate entry');
    const filesGenerator = new _FilesGenerator.default(this);
    filesGenerator.generate();
    const webpackConfig = (0, _getWebpackConfig.default)(this);
    this.webpackConfig = webpackConfig;
    return new Promise(resolve => {
      require('af-webpack/build').default({
        // eslint-disable-line
        webpackConfig,
        success: ({
          stats
        }) => {
          if (process.env.RM_TMPDIR !== 'none') {
            debug(`Clean tmp dir ${this.paths.tmpDirPath}`); // rimraf(this.paths.absTmpDirPath);
          }

          debug(`Bundle html files`);
          const chunksMap = (0, _chunksToMap.default)(stats.compilation.chunks);

          try {
            const hg = new _HtmlGenerator.default(this, {
              chunksMap
            });
            hg.generate();
          } catch (e) {
            console.log(e);
          }

          debug('Move service-worker.js');
          const sourceSW = (0, _path.join)(this.paths.absOutputPath, this.staticDirectory, 'service-worker.js');
          const targetSW = (0, _path.join)(this.paths.absOutputPath, 'service-worker.js');

          if ((0, _fs.existsSync)(sourceSW)) {
            (0, _fs.renameSync)(sourceSW, targetSW);
          }

          this.applyPlugins('buildSuccess');
          (0, _send.default)({
            type: _send.BUILD_DONE
          });
          resolve();
        }
      });
    });
  }

}

exports.default = Service;