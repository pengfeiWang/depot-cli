"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

function _default(api) {
  const config = api.config;
  const winPath = api.utils.winPath;
  const _api$service = api.service,
        outputPath = _api$service.outputPath,
        webpackConfig = _api$service.webpackConfig,
        webpackRCConfig = _api$service.webpackRCConfig;
  const isDev = process.env.NODE_ENV === 'development';

  function getAssetsPath(pth) {
    return pth.replace(/^\.\/\.\//, './');
  }

  const cwd = api.service;

  function rmDist(p) {
    return p.replace('/dist', '').replace('dist', '');
  }

  function repPath(path) {
    return winPath(path.replace(/\/+/g, '/'));
  }

  function makeSureHaveLastSlash(str) {
    if (str.slice(-1) === '/') {
      return str;
    } else {
      return `${str}/`;
    }
  }

  api.register('modifyHTML', obj => {
    const memo = obj.memo;
    const copy = api.service.webpackRCConfig.copy;
    let content = memo;

    try {
      // dist/static
      // const webOutPath = api.service.webpackConfig.output.path;
      // /
      // const webPublicPath = repPath(makeSureHaveLastSlash(api.service.webpackConfig.output.publicPath));
      // const relPath = repPath(`${webPublicPath}/${rmDist(relative(process.cwd(), webOutPath))}`);
      if (!isDev) {
        content = memo.replace(/(src\/assets\/|\.\/src\/assets\/)/g, `${api.service.webpackConfig.output.publicPath}`);
      }
    } catch (e) {
      console.log(e);
    }

    return content;
  });
}