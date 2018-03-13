import { join, relative } from 'path';

export default function(api) {
  const { config } = api;
  const { winPath } = api.utils;
  const { outputPath, webpackConfig, webpackRCConfig } = api.service;
  const isDev = process.env.NODE_ENV === 'development';

  function getAssetsPath(pth) {
    return pth.replace(
      /^\.\/\.\//,
      './',
    );
  }
  const cwd = api.service;
  function rmDist (p) {
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
  api.register('modifyHTML', (obj) => {
    const { memo } = obj;
    const copy = api.service.webpackRCConfig.copy;
    let content = memo;
    try {
      // dist/static
      // const webOutPath = api.service.webpackConfig.output.path;
      // /
      // const webPublicPath = repPath(makeSureHaveLastSlash(api.service.webpackConfig.output.publicPath));
      // const relPath = repPath(`${webPublicPath}/${rmDist(relative(process.cwd(), webOutPath))}`);
      
      if (!isDev) {
        content = memo.replace(
          /(src\/assets\/|\.\/src\/assets\/)/g,
          `${api.service.webpackConfig.output.publicPath}`
        );
      }
    } catch(e) {
      console.log(e);
    }
    return content;
  });
}
