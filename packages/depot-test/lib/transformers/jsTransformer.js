'use strict';

var _babelJest = _interopRequireDefault(require('babel-jest'));

var _path = require('path');

var _depotUtils = require('depot-utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const cwd = process.cwd();
module.exports = _babelJest.default.createTransformer({
  presets: [
    require.resolve('@babel/preset-typescript'),
    [
      require.resolve('depot-babel-preset'),
      {
        transformRuntime: false,
      },
    ],
  ],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          // Projects don't need to install react, react-dom and enzyme
          react: (0, _depotUtils.compatDirname)(
            'react/package',
            cwd,
            (0, _path.dirname)(require.resolve('react/package.json')),
          ),
          'react-dom': (0, _depotUtils.compatDirname)(
            'react-dom/package',
            cwd,
            (0, _path.dirname)(require.resolve('react-dom/package.json')),
          ),
          enzyme: (0, _depotUtils.compatDirname)(
            'enzyme/package.json',
            cwd,
            (0, _path.dirname)(require.resolve('enzyme/package.json')),
          ),
          'enzyme-adapter-react-16': (0, _depotUtils.compatDirname)(
            'enzyme-adapter-react-16/package.json',
            cwd,
            (0, _path.dirname)(
              require.resolve('enzyme-adapter-react-16/package.json'),
            ),
          ),
        },
      },
      'depot-test',
    ],
  ],
});
