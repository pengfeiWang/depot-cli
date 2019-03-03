'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.getLocaleFileList = getLocaleFileList;
exports.isNeedPolyfill = isNeedPolyfill;
exports.default = _default;

var _path = require('path');

var _fs = require('fs');

var _depotUtils = require('depot-utils');

var _mustache = _interopRequireDefault(require('mustache'));

var _globby = _interopRequireDefault(require('globby'));

var _lodash = _interopRequireDefault(require('lodash.groupby'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }),
      );
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
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

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError('Invalid attempt to destructure non-iterable instance');
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

const momentLocation = require
  .resolve('moment/locale/zh-cn')
  .replace(/zh\-cn\.js$/, '');

function getMomentLocale(lang, country) {
  if (
    (0, _fs.existsSync)(
      (0, _path.join)(
        momentLocation,
        `${lang}-${country.toLocaleLowerCase()}.js`,
      ),
    )
  ) {
    return `${lang}-${country.toLocaleLowerCase()}`;
  }

  if ((0, _fs.existsSync)((0, _path.join)(momentLocation, `${lang}.js`))) {
    return lang;
  }

  return '';
} // export for test

function getLocaleFileList(absSrcPath, absPagesPath, singular) {
  const localeFileMath = /^([a-z]{2})-([A-Z]{2})\.(js|ts)$/;
  const localeFolder = singular ? 'locale' : 'locales';

  const localeFiles = _globby.default
    .sync('*.{ts,js}', {
      cwd: (0, _path.join)(absSrcPath, localeFolder),
    })
    .map(name => (0, _path.join)(absSrcPath, localeFolder, name))
    .concat(
      _globby.default
        .sync(`**/${localeFolder}/*.{ts,js}`, {
          cwd: absPagesPath,
        })
        .map(name => (0, _path.join)(absPagesPath, name)),
    )
    .filter(p => localeFileMath.test((0, _path.basename)(p)))
    .map(fullname => {
      const fileName = (0, _path.basename)(fullname);
      const fileInfo = localeFileMath.exec(fileName);
      return {
        name: `${fileInfo[1]}-${fileInfo[2]}`,
        path: fullname,
      };
    });

  const groups = (0, _lodash.default)(localeFiles, 'name');
  return Object.keys(groups).map(name => {
    const fileInfo = name.split('-');
    return {
      lang: fileInfo[0],
      name,
      country: fileInfo[1],
      paths: groups[name].map(item => (0, _depotUtils.winPath)(item.path)),
      momentLocale: getMomentLocale(fileInfo[0], fileInfo[1]),
    };
  });
} // data come from https://caniuse.com/#search=intl
// you can find all browsers in https://github.com/browserslist/browserslist#browsers

const polyfillTargets = {
  ie: 10,
  firefox: 28,
  chrome: 23,
  safari: 9.1,
  opera: 12.1,
  ios: 9.3,
  ios_saf: 9.3,
  operamini: Infinity,
  op_mini: Infinity,
  android: 4.3,
  blackberry: Infinity,
  operamobile: 12.1,
  op_mob: 12.1,
  explorermobil: 10,
  ie_mob: 10,
  ucandroid: Infinity,
};

function isNeedPolyfill(targets = {}) {
  return (
    Object.keys(targets).find(key => {
      return (
        polyfillTargets[key.toLocaleLowerCase()] &&
        polyfillTargets[key.toLocaleLowerCase()] >= targets[key]
      );
    }) !== undefined
  );
}

function _default(api, options = {}) {
  const config = api.config,
    paths = api.paths;
  const targets = config.targets;

  if (isNeedPolyfill(targets)) {
    api.addEntryPolyfillImports({
      source: 'intl',
    });
  }

  api.addPageWatcher(
    (0, _path.join)(paths.absSrcPath, config.singular ? 'locale' : 'locales'),
  );
  api.onOptionChange(newOpts => {
    options = newOpts;
    api.rebuildTmpFiles();
  });
  api.addRendererWrapperWithComponent(() => {
    const localeFileList = getLocaleFileList(
      paths.absSrcPath,
      paths.absPagesPath,
      config.singular,
    );
    const wrapperTpl = (0, _fs.readFileSync)(
      (0, _path.join)(__dirname, '../template/wrapper.jsx.tpl'),
      'utf-8',
    );
    const defaultLocale = options.default || 'zh-CN';

    const _defaultLocale$split = defaultLocale.split('-'),
      _defaultLocale$split2 = _slicedToArray(_defaultLocale$split, 2),
      lang = _defaultLocale$split2[0],
      country = _defaultLocale$split2[1];

    const wrapperContent = _mustache.default.render(wrapperTpl, {
      localeList: localeFileList,
      antd: options.antd === undefined ? true : options.antd,
      baseNavigator:
        options.baseNavigator === undefined ? true : options.baseNavigator,
      useLocalStorage: true,
      defaultLocale,
      defaultLang: lang,
      defaultAntdLocale: `${lang}_${country}`,
      defaultMomentLocale: getMomentLocale(lang, country),
    });

    const wrapperPath = (0, _path.join)(
      paths.absTmpDirPath,
      './LocaleWrapper.jsx',
    );
    (0, _fs.writeFileSync)(wrapperPath, wrapperContent, 'utf-8');
    return wrapperPath;
  });
  api.modifyAFWebpackOpts(memo => {
    return _objectSpread({}, memo, {
      alias: _objectSpread({}, memo.alias || {}, {
        // depot/locale is deprecated
        // recommend use `import { getLocale } from 'depot-plugin-locale';` now.
        'depot/locale': (0, _path.join)(__dirname, './locale.js'),
        'react-intl': (0, _path.dirname)(
          require.resolve('react-intl/package.json'),
        ),
      }),
    });
  });
}