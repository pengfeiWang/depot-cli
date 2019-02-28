"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(context, opts = {}) {
  const nodeEnv = process.env.NODE_ENV;
  const _opts$useBuiltIns = opts.useBuiltIns,
        useBuiltIns = _opts$useBuiltIns === void 0 ? false : _opts$useBuiltIns,
        _opts$loose = opts.loose,
        loose = _opts$loose === void 0 ? false : _opts$loose,
        _opts$targets = opts.targets,
        targets = _opts$targets === void 0 ? {
    browsers: ['last 2 versions']
  } : _opts$targets,
        _opts$env = opts.env,
        env = _opts$env === void 0 ? {} : _opts$env;
  const transformRuntime = 'transformRuntime' in opts ? opts.transformRuntime : {};
  const exclude = ['transform-typeof-symbol', 'transform-unicode-regex', 'transform-sticky-regex', 'transform-new-target', 'transform-modules-umd', 'transform-modules-systemjs', 'transform-modules-amd', 'transform-literals'];
  const plugins = [require.resolve('babel-plugin-react-require'), require.resolve('@babel/plugin-syntax-dynamic-import'), [require.resolve('@babel/plugin-proposal-object-rest-spread'), {
    loose,
    useBuiltIns
  }], require.resolve('@babel/plugin-proposal-optional-catch-binding'), require.resolve('@babel/plugin-proposal-async-generator-functions'), // 下面两个的顺序的配置都不能动
  [require.resolve('@babel/plugin-proposal-decorators'), {
    legacy: true
  }], [require.resolve('@babel/plugin-proposal-class-properties'), {
    loose: true
  }], require.resolve('@babel/plugin-proposal-export-namespace-from'), require.resolve('@babel/plugin-proposal-export-default-from'), [require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), {
    loose
  }], [require.resolve('@babel/plugin-proposal-optional-chaining'), {
    loose
  }], [require.resolve('@babel/plugin-proposal-pipeline-operator'), {
    proposal: 'minimal'
  }], require.resolve('@babel/plugin-proposal-do-expressions'), require.resolve('@babel/plugin-proposal-function-bind'), require.resolve('babel-plugin-macros')];

  if (nodeEnv !== 'test' && transformRuntime) {
    plugins.push([require.resolve('@babel/plugin-transform-runtime'), transformRuntime]);
  }

  if (nodeEnv === 'production') {
    plugins.push(require.resolve('babel-plugin-transform-react-remove-prop-types'));
  }

  return {
    presets: [[require.resolve('@babel/preset-env'), _objectSpread({
      targets,
      loose,
      modules: 'commonjs',
      exclude
    }, env)], require.resolve('@babel/preset-react')],
    plugins
  };
}