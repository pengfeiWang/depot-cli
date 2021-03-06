"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _requireindex = _interopRequireDefault(require("requireindex"));

var _chalk = _interopRequireDefault(require("chalk"));

var _lodash = require("lodash");

var _extend = _interopRequireDefault(require("extend2"));

var _depotUtils = require("depot-utils");

var _signale = _interopRequireDefault(require("signale"));

var _constants = require("./constants");

var _watch = require("./getConfig/watch");

var _isEqual = _interopRequireDefault(require("./isEqual"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function normalizeConfig(config) {
  config = config.default || config;

  if (config.context && config.pages) {
    Object.keys(config.pages).forEach(key => {
      const page = config.pages[key];
      page.context = _objectSpread({}, config.context, {}, page.context);
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

function getConfigFile(cwd, service) {
  const files = _constants.CONFIG_FILES.map(file => (0, _path.join)(cwd, file)).filter(file => (0, _fs.existsSync)(file));

  if (files.length > 1 && service.printWarn) {
    service.printWarn([`Muitiple config files ${files.join(', ')} detected, depot will use ${files[0]}.`]);
  }

  return files[0];
}

function requireFile(filePath, opts = {}) {
  if (!(0, _fs.existsSync)(filePath)) {
    return {};
  }

  const onError = opts.onError || function (e) {
    console.error(e);
    return {};
  };

  try {
    const config = require(filePath) || {}; // eslint-disable-line

    return normalizeConfig(config);
  } catch (e) {
    return onError(e, filePath);
  }
}

class UserConfig {
  static getConfig(opts = {}) {
    const cwd = opts.cwd,
          service = opts.service;
    const absConfigPath = getConfigFile(cwd, service);
    const env = process.env.DEPOT_ENV;
    const isDev = process.env.NODE_ENV === 'development';
    const defaultConfig = service.applyPlugins('modifyDefaultConfig', {
      initialValue: {}
    });

    if (absConfigPath) {
      return normalizeConfig((0, _extend.default)(true, defaultConfig, requireFile(absConfigPath), env ? requireFile(absConfigPath.replace(/\.js$/, `.${env}.js`)) : {} // isDev ? requireFile(absConfigPath.replace(/\.js$/, '.local.js')) : {},
      ));
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
    plugins = this.service.applyPlugins('_registerConfig', {
      initialValue: plugins
    });
    this.plugins = plugins.map(p => p(this));
  }

  printError(messages) {
    if (this.service.printError) this.service.printError(messages);
  }

  getConfig(opts = {}) {
    const env = process.env.DEPOT_ENV;
    const isDev = process.env.NODE_ENV === 'development';
    const _this$service = this.service,
          paths = _this$service.paths,
          cwd = _this$service.cwd;
    const force = opts.force,
          setConfig = opts.setConfig;
    const defaultConfig = this.service.applyPlugins('modifyDefaultConfig', {
      initialValue: {}
    });
    const file = getConfigFile(paths.cwd, this.service);
    this.file = file;

    if (!file) {
      return defaultConfig;
    } // 强制读取，不走 require 缓存


    if (force) {
      Object.keys(require.cache).forEach(file => {
        if ((0, _depotUtils.winPath)(file).indexOf((0, _depotUtils.winPath)((0, _path.join)(paths.cwd, 'config/'))) === 0) {
          delete require.cache[file];
        }
      });

      _constants.CONFIG_FILES.forEach(file => {
        delete require.cache[(0, _path.join)(paths.cwd, file)];
        delete require.cache[(0, _path.join)(paths.cwd, file.replace(/\.js$/, `.${env}.js`))];
        delete require.cache[(0, _path.join)(paths.cwd, file.replace(/\.js$/, `.local.js`))];
      });
    }

    let config = null;
    const relativeFile = file.replace(`${paths.cwd}/`, '');
    this.relativeFile = relativeFile;

    const onError = (e, file) => {
      const msg = `配置文件 "${file.replace(`${paths.cwd}/`, '')}" 解析出错，请检查语法。
\r\n${e.toString()}`;
      this.printError(msg);
      throw new Error(msg);
    };

    config = normalizeConfig((0, _extend.default)(true, defaultConfig, requireFile(file, {
      onError
    }), env ? requireFile(file.replace(/\.js$/, `.${env}.js`)) : {}, isDev ? requireFile(file.replace(/\.js$/, '.local.js')) : {}));
    config = this.service.applyPlugins('_modifyConfig', {
      initialValue: config
    }); // Validate

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
            plugin.validate.call({
              cwd
            }, config[name]);
          } catch (e) {
            // 校验出错后要把值设到缓存的 config 里，确保 watch 判断时才能拿到正确的值
            if (setConfig) {
              setConfig(config);
            }

            this.printError(e.message);
            throw new Error(`配置 ${name} 校验失败, ${e.message}`);
          }
        }
      } // 找下不匹配的 name

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

    const pluginNames = this.plugins.map(p => p.name);
    Object.keys(config).forEach(key => {
      if (!pluginNames.includes(key)) {
        if (opts.setConfig) {
          opts.setConfig(config);
        } // const affixmsg = `选择 "${pluginNames.join(', ')}" 中的一项`;
        // const guess = didyoumean(key, pluginNames);
        // const midMsg = guess ? `你是不是想配置 "${guess}" ？ 或者` : '请';
        // const msg = `"${relativeFile}" 中配置的 "${key}" 并非约定的配置项，${midMsg}${affixmsg}`;


        const msg = `"${relativeFile}" 中配置的 "${key}" 并非约定的配置项`;
        this.printError(msg);
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
      _signale.default.debug(`[${event}] ${path}`);

      try {
        const newConfig = this.getConfig({
          force: true,
          setConfig: newConfig => {
            this.config = newConfig;
          }
        }); // 从失败中恢复过来，需要 reload 一次

        if (this.configFailed) {
          this.configFailed = false;
          this.service.refreshBrowser();
        }

        const oldConfig = (0, _lodash.cloneDeep)(this.config);
        this.config = newConfig;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            const plugin = _step3.value;
            const name = plugin.name;

            if (!(0, _isEqual.default)(newConfig[name], oldConfig[name])) {
              this.service.config[name] = newConfig[name];
              this.service.applyPlugins('onConfigChange', {
                args: {
                  newConfig
                }
              });

              if (plugin.onChange) {
                plugin.onChange(newConfig, oldConfig);
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
      } catch (e) {
        this.configFailed = true;
        console.error(_chalk.default.red(`watch handler failed, since ${e.message}`));
        console.error(e);
      }
    });
  }

  watchConfigs(handler) {
    const env = process.env.DEPOT_ENV; // console.log(env);

    const watcher = this.watch('CONFIG_FILES', (0, _lodash.flatten)(_constants.CONFIG_FILES.concat('config/').map(file => [file, env ? [file.replace(/\.js$/, `.${env}.js`)] : [], file.replace(/\.js$/, `.local.js`)])));

    if (watcher) {
      watcher.on('all', handler);
    }
  }

}

var _default = UserConfig;
exports.default = _default;