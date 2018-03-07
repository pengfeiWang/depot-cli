'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.normalizePath = normalizePath;

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function _sliceIterator(arr, i) {
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

function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    return _sliceIterator(arr, i);
  } else {
    throw new TypeError('Invalid attempt to destructure non-iterable instance');
  }
}

function addHtmlAffix(pathname) {
  if (pathname.slice(-1) === '/' || pathname.slice(-5) === '.html') {
    return pathname;
  } else {
    return ''.concat(pathname, '.html');
  }
}

function normalizePath(path) {
  if (typeof path === 'string') {
    var _path$split = path.split('?'),
      _path$split2 = _slicedToArray(_path$split, 2),
      pathname = _path$split2[0],
      search = _path$split2[1];

    return ''
      .concat(addHtmlAffix(pathname))
      .concat(search ? '?' : '')
      .concat(search || '');
  }

  return _extends({}, path, {
    pathname: addHtmlAffix(path.pathname),
  });
}
