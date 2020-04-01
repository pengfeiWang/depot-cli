import babelJest from 'babel-jest';
import { dirname } from 'path';
import { compatDirname } from 'depot-utils';
var cwd = process.cwd();
module.exports = babelJest.createTransformer({
  presets: [require.resolve('@babel/preset-typescript'), [require.resolve('depot-babel-preset'), {
    transformRuntime: false
  }]],
  plugins: [[require.resolve('babel-plugin-module-resolver'), {
    alias: {
      // Projects don't need to install react, react-dom and enzyme
      react: compatDirname('react/package', cwd, dirname(require.resolve('react/package.json'))),
      'react-dom': compatDirname('react-dom/package', cwd, dirname(require.resolve('react-dom/package.json'))),
      enzyme: compatDirname('enzyme/package.json', cwd, dirname(require.resolve('enzyme/package.json'))),
      'enzyme-adapter-react-16': compatDirname('enzyme-adapter-react-16/package.json', cwd, dirname(require.resolve('enzyme-adapter-react-16/package.json')))
    }
  }, 'depot-test']]
});