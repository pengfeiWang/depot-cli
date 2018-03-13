"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _requireindex = _interopRequireDefault(require("requireindex"));

var _chalk = _interopRequireDefault(require("chalk"));

var _didyoumean = _interopRequireDefault(require("didyoumean"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _constants = require("./constants");

var _watch = require("./getConfig/watch");

var _createRouteMiddleware = require("./createRouteMiddleware");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function normalizeConfig(config) {
  config = config.default || config;

  if (config.context && config.pages) {
    Object.keys(config.pages).forEach(key => {
      const page = config.pages[key];
      page.context = _extends({}, config.context, page.context);
    });
  } // pages 配置补丁
  // /index -> /index.html
  // index -> /index.html


  if (config.pages) {
    const htmlSuffix = !!(config.exportStatic && typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix);
    config.pages = Object.keys(config.pages).reduce((memo, key) => {
      let newKey = key;

      if (htmlSuffix && newKey.slice(-1) !== '/' && newKey.slice(-5) !== '.html') {
        newKey = `${newKey}.html`;
      }

      if (newKey.charAt(0) !== '/') {
        newKey = `/${newKey}`;
      }

      memo[newKey] = config.pages[key];
      return memo;
    }, {});
  }

  return config;
}

class UserConfig {
  static getConfig(opts = {}) {
    const cwd = opts.cwd;
    const absConfigPath = (0, _path.join)(cwd, _constants.CONFIG_FILES[0]);

    if ((0, _fs.existsSync)(absConfigPath)) {
      try {
        const config = require(absConfigPath) || {}; // eslint-disable-line

        return normalizeConfig(config);
      } catch (e) {
        console.error(e);
        return {};
      }
    } else {
      return {};
    }
  }

  constructor(service) {
    this.service = service;
    this.configFailed = false;
    this.config = null;
    this.file = null;
    this.relativeFile = null;
    this.watch = _watch.watch;
    this.unwatch = _watch.unwatch;
    this.initConfigPlugins();
  }

  initConfigPlugins() {
    const map = (0, _requireindex.default)((0, _path.join)(__dirname, 'getConfig/configPlugins'));
    let plugins = Object.keys(map).map(key => {
      return map[key].default;
    });
    plugins = this.service.applyPlugins('modifyConfigPlugins', {
      initialValue: plugins
    });
    this.plugins = plugins.map(p => p(this));
  }

  getConfigFile() {
    const _service = this.service,
          paths = _service.paths,
          printWarn = _service.printWarn,
          libraryName = _service.libraryName;

    const files = _constants.CONFIG_FILES.map(file => (0, _path.join)(paths.cwd, file)).filter(file => (0, _fs.existsSync)(file));

    if (files.length > 1) {
      printWarn(`Muitiple config files ${files.join(', ')} detected, ${libraryName} will use ${files[0]}.`);
    }

    return files[0];
  }

  getConfig(opts = {}) {
    const _service2 = this.service,
          paths = _service2.paths,
          printError = _service2.printError,
          cwd = _service2.cwd;
    const force = opts.force,
          setConfig = opts.setConfig;
    const file = this.getConfigFile();
    this.file = file;

    if (!file) {
      return {};
    } // 强制读取，不走 require 缓存


    if (force) {
      _constants.CONFIG_FILES.forEach(file => {
        delete require.cache[(0, _path.join)(paths.cwd, file)];
      });
    }

    let config = null;
    const relativeFile = file.replace(`${paths.cwd}/`, '');
    this.relativeFile = relativeFile;

    try {
      config = require(file); // eslint-disable-line
    } catch (e) {
      const msg = `配置文件 "${relativeFile}" 解析出错，请检查语法。
\r\n${e.toString()}`;
      printError(msg);
      throw new Error(msg);
    }

    config = normalizeConfig(config); // Validate

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const plugin = _step.value;
        const name = plugin.name,
              validate = plugin.validate;

        if (config[name] && validate) {
          try {
            plugin.validate(config[name]);
          } catch (e) {
            // 校验出错后要把值设到缓存的 config 里，确保 watch 判断时才能拿到正确的值
            if (setConfig) {
              setConfig(config);
            }

            printError(e.message);
            throw new Error(`配置 ${name} 校验失败, ${e.message}`);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (typeof config.directoryConfigRoute === 'string') {
      const srcPath = /src/.test(config.directoryConfigRoute) ? config.directoryConfigRoute : `./src/${config.directoryConfigRoute}`;
      const absPagesPath = (0, _path.join)(cwd, srcPath);
      this.service.paths = _extends({}, this.service.paths, {
        absPagesPath,
        pagesPath: srcPath,
        absPageDocumentPath: (0, _path.join)(absPagesPath, 'document.ejs')
      });
    } // 找下不匹配的 name


    const pluginNames = this.plugins.map(p => p.name);
    Object.keys(config).forEach(key => {
      if (!pluginNames.includes(key)) {
        if (opts.setConfig) {
          opts.setConfig(config);
        }

        const affixmsg = `选择 "${pluginNames.join(', ')}" 中的一项`;
        const guess = (0, _didyoumean.default)(key, pluginNames);
        const midMsg = guess ? `你是不是想配置 "${guess}" ？ 或者` : '请';
        const msg = `"${relativeFile}" 中配置的 "${key}" 并非约定的配置项，${midMsg}${affixmsg}`;
        printError(msg);
        throw new Error(msg);
      }
    });
    return config;
  }

  setConfig(config) {
    this.config = config;
  }

  watchWithDevServer() {
    // 配置插件的监听
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = this.plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const plugin = _step2.value;

        if (plugin.watch) {
          plugin.watch();
        }
      } // 配置文件的监听

    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    this.watchConfigs((event, path) => {
      console.log(`[DEBUG] [${event}] ${path}`);

      try {
        const newConfig = this.getConfig({
          force: true,
          setConfig: newConfig => {
            this.config = newConfig;
          }
        }); // 更新 middleware 的配置

        (0, _createRouteMiddleware.setConfig)(newConfig); // 从失败中恢复过来，需要 reload 一次

        if (this.configFailed) {
          this.configFailed = false;
          this.service.reload();
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            const plugin = _step3.value;
            const name = plugin.name;

            if (!(0, _lodash.default)(newConfig[name], this.config[name])) {
              if (plugin.onChange) {
                plugin.onChange(newConfig);
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        this.config = newConfig;
      } catch (e) {
        this.configFailed = true;
        console.error(_chalk.default.red(`watch handler failed, since ${e.message}`));
        console.error(e);
      }
    });
  }

  watchConfigs(handler) {
    return this.watch('CONFIG_FILES', _constants.CONFIG_FILES).on('all', handler);
  }

}

var _default = UserConfig;
exports.default = _default;