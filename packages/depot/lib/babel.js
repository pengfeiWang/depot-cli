'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

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

function _default(context, opts = {}) {
  const libraryName =
    /* opts.libraryName ||  */
    'depot';
  return {
    presets: [
      [
        require.resolve('babel-preset-umi'),
        _extends({}, opts, {
          preact: true,
        }),
      ],
    ],
    plugins: [
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        },
        'antd',
      ],
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'es',
          style: true,
        },
        'antd-mobile',
      ],
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            [`${libraryName}/dynamic`]: require.resolve('./dynamic'),
            [`${libraryName}/link`]: require.resolve('./link'),
            [`${libraryName}/navlink`]: require.resolve('./navlink'),
            [`${libraryName}/redirect`]: require.resolve('./redirect'),
            [`${libraryName}/router`]: require.resolve('./router'),
            [`${libraryName}/withRouter`]: require.resolve('./withRouter'),
            [`${libraryName}/_createHistory`]: require.resolve(
              './createHistory',
            ),
          },
        },
      ],
    ],
  };
}
