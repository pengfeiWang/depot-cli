'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _fs = require('fs');

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

function getAliasPathWithKey(alias, key) {
  const thePath = alias[key];

  if (alias[thePath]) {
    return getAliasPathWithKey(alias, thePath);
  }

  return thePath;
}

function _default(api) {
  const debug = api.debug;
  api.registerCommand(
    'test',
    {
      webpack: true,
      description: 'run test files *.test.js and *.e2e.js',
    },
    (args = {}) => {
      const alias = api.webpackConfig.resolve.alias;
      const moduleNameMapper = Object.keys(alias).reduce((memo, key) => {
        const aliasPath = getAliasPathWithKey(alias, key);

        if (
          (0, _fs.existsSync)(aliasPath) &&
          (0, _fs.statSync)(aliasPath).isDirectory()
        ) {
          memo[`^${key}/(.*)$`] = `${aliasPath}/$1`;
          memo[`^${key}$`] = aliasPath;
        } else {
          memo[`^${key}$`] = aliasPath;
        }

        return memo;
      }, {});
      debug('moduleNameWrapper');
      debug(moduleNameMapper);
      args._ = args._.slice(1);
      if (args.w) args.watch = args.w;

      require('depot-test')
        .default(
          _objectSpread(
            {
              cwd: api.cwd,
              moduleNameMapper,
            },
            args,
          ),
        )
        .catch(e => {
          debug(e);
          process.exit(1);
        });
    },
  );
}
