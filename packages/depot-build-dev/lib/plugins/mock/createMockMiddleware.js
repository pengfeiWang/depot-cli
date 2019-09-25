'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = getMockMiddleware;

var _fs = require('fs');

var _path = require('path');

var _bodyParser = _interopRequireDefault(require('body-parser'));

var _glob = _interopRequireDefault(require('glob'));

var _assert = _interopRequireDefault(require('assert'));

var _chokidar = _interopRequireDefault(require('chokidar'));

var _pathToRegexp = _interopRequireDefault(require('path-to-regexp'));

var _signale = _interopRequireDefault(require('signale'));

var _multer = _interopRequireDefault(require('multer'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const BODY_PARSED_METHODS = ['post', 'put', 'patch', 'delete'];

function getMockMiddleware(api, errors) {
  const debug = api.debug,
    paths = api.paths;
  const cwd = paths.cwd,
    absPagesPath = paths.absPagesPath;
  const absMockPath = (0, _path.join)(cwd, 'mock');
  const absConfigPath = (0, _path.join)(cwd, '.depotrc.mock.js');
  api.addBabelRegister([absMockPath, absConfigPath, absPagesPath]);
  let mockData = getConfig();
  watch();

  function watch() {
    if (process.env.WATCH_FILES === 'none') return;

    const watcher = _chokidar.default.watch(
      [
        absConfigPath,
        absMockPath,
        (0, _path.join)(absPagesPath, '**/_mock.js'),
      ],
      {
        ignoreInitial: true,
      },
    );

    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`);
      mockData = getConfig();

      if (!errors.length) {
        _signale.default.success(`Mock file parse success`);
      }
    });
  }

  function getConfig() {
    // Clear errors
    errors.splice(0, errors.length);
    cleanRequireCache();
    let ret = {};

    if ((0, _fs.existsSync)(absConfigPath)) {
      debug(`load mock data from ${absConfigPath}`);
      ret = require(absConfigPath); // eslint-disable-line
    } else {
      const mockFiles = _glob.default
        .sync('**/*.js', {
          cwd: absMockPath,
        })
        .map(p => (0, _path.join)(absMockPath, p))
        .concat(
          _glob.default
            .sync('**/_mock.js', {
              cwd: absPagesPath,
            })
            .map(p => (0, _path.join)(absPagesPath, p)),
        );

      debug(
        `load mock data from ${absMockPath}, including files ${JSON.stringify(
          mockFiles,
        )}`,
      );

      try {
        ret = mockFiles.reduce((memo, mockFile) => {
          const m = require(mockFile); // eslint-disable-line

          memo = _objectSpread({}, memo, {}, m.default || m);
          return memo;
        }, {});
      } catch (e) {
        errors.push(e);

        _signale.default.error(`Mock file parse failed`);

        console.error(e.message);
      }
    }

    const rs = normalizeConfig(ret);
    return rs;
  }

  function parseKey(key) {
    let method = 'get';
    let path = key;

    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ');
      method = splited[0].toLowerCase();
      path = splited[1]; // eslint-disable-line
    }

    (0, _assert.default)(
      VALID_METHODS.includes(method),
      `Invalid method ${method} for path ${path}, please check your mock files.`,
    );
    return {
      method,
      path,
    };
  }

  function createHandler(method, path, handler) {
    return function(req, res, next) {
      if (BODY_PARSED_METHODS.includes(method)) {
        _bodyParser.default.json({
          limit: '5mb',
          strict: false,
        })(req, res, () => {
          _bodyParser.default.urlencoded({
            limit: '5mb',
            extended: true,
          })(req, res, () => {
            sendData();
          });
        });
      } else {
        sendData();
      }

      function sendData() {
        if (typeof handler === 'function') {
          (0, _multer.default)().any()(req, res, () => {
            handler(req, res, next);
          });
        } else {
          res.json(handler);
        }
      }
    };
  }

  function normalizeConfig(config) {
    return Object.keys(config).reduce((memo, key) => {
      const handler = config[key];
      const type = typeof handler;
      (0, _assert.default)(
        type === 'function' || type === 'object',
        `mock value of ${key} should be function or object, but got ${type}`,
      );

      const _parseKey = parseKey(key),
        method = _parseKey.method,
        path = _parseKey.path;

      const keys = [];
      const re = (0, _pathToRegexp.default)(path, keys);
      memo.push({
        method,
        path,
        re,
        keys,
        handler: createHandler(method, path, handler),
      });
      return memo;
    }, []);
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (
        file === absConfigPath ||
        file.indexOf(absMockPath) > -1 ||
        (0, _path.basename)(file) === '_mock.js'
      ) {
        delete require.cache[file];
      }
    });
  }

  function matchMock(req) {
    const exceptPath = req.path;
    const exceptMethod = req.method.toLowerCase();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (
        var _iterator = mockData[Symbol.iterator](), _step;
        !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
        _iteratorNormalCompletion = true
      ) {
        const mock = _step.value;
        const method = mock.method,
          re = mock.re,
          keys = mock.keys;

        if (method === exceptMethod) {
          const match = re.exec(req.path);

          if (match) {
            const params = {};

            for (let i = 1; i < match.length; i = i + 1) {
              const key = keys[i - 1];
              const prop = key.name;
              const val = decodeParam(match[i]);

              if (val !== undefined || !hasOwnProperty.call(params, prop)) {
                params[prop] = val;
              }
            }

            req.params = params;
            return mock;
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

    function decodeParam(val) {
      if (typeof val !== 'string' || val.length === 0) {
        return val;
      }

      try {
        return decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          err.message = `Failed to decode param ' ${val} '`;
          err.status = err.statusCode = 400;
        }

        throw err;
      }
    }

    return mockData.filter(({ method, re }) => {
      return method === exceptMethod && re.test(exceptPath);
    })[0];
  }

  return function DEPOT_MOCK(req, res, next) {
    const match = matchMock(req);

    if (match) {
      debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
