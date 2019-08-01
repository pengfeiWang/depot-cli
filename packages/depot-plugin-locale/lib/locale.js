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

/* eslint-disable no-undef, prefer-rest-params */
var ReactIntl = require('react-intl');

function setLocale(lang) {
  if (lang !== undefined && !/^([a-z]{2})-([A-Z]{2})$/.test(lang)) {
    // for reset when lang === undefined
    throw new Error('setLocale lang format error');
  }

  if (getLocale() !== lang) {
    window.localStorage.setItem('depot_locale', lang || '');
    window.location.reload();
  }
}

function getLocale() {
  return window.g_lang;
} // init api methods

var intl;
var intlApi = {};
[
  'formatMessage',
  'formatHTMLMessage',
  'formatDate',
  'formatTime',
  'formatRelative',
  'formatNumber',
  'formatPlural',
  'now',
  'onError',
].forEach(function(methodName) {
  intlApi[methodName] = function() {
    if (intl && intl[methodName]) {
      var _intl$methodName;

      // _setIntlObject has been called
      return (_intl$methodName = intl[methodName]).call.apply(
        _intl$methodName,
        [intl].concat(Array.prototype.slice.call(arguments)),
      );
    } else if (console && console.warn) {
      console.warn(
        '[depot-plugin-locale] '.concat(
          methodName,
          ' not initialized yet, you should use it after react app mounted.',
        ),
      );
    }

    return null;
  };
}); // react-intl 没有直接暴露 formatMessage 这个方法
// 只能注入到 props 中，所以通过在最外层包一个组件然后组件内调用这个方法来把 intl 这个对象暴露到这里来
// TODO 查找有没有更好的办法

function _setIntlObject(theIntl) {
  // depot 系统 API，不对外暴露
  intl = theIntl;
}

module.exports = _objectSpread({}, ReactIntl, {}, intlApi, {
  setLocale: setLocale,
  getLocale: getLocale,
  _setIntlObject: _setIntlObject,
});
