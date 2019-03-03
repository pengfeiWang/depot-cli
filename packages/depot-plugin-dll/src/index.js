import { join } from 'path';
import serveStatic from 'serve-static';
import buildDll from './buildDll';

export default function(api, opts = {}) {
  if (process.env.NODE_ENV !== 'development') return;

  const { debug, paths } = api;

  const dllDir = join(paths.absNodeModulesPath, 'depot-dlls');
  const dllManifest = join(dllDir, 'depot.json');

  api.register('_beforeDevServerAsync', () => {
    return new Promise((resolve, reject) => {
      buildDll({
        api,
        dllDir,
        ...opts,
      })
        .then(() => {
          debug('depot-plugin-dll done');
          resolve();
        })
        .catch(e => {
          console.log('[depot-plugin-dll] error', e);
          reject(e);
        });
    });
  });

  api.addMiddlewareAhead(() => {
    return serveStatic(dllDir);
  });

  api.chainWebpackConfig(webpackConfig => {
    const webpack = require(api._resolveDeps('af-webpack/webpack')); // eslint-disable-line
    webpackConfig.plugin('dll-reference').use(webpack.DllReferencePlugin, [
      {
        context: paths.absSrcPath,
        manifest: dllManifest,
      },
    ]);
  });

  api.addHTMLHeadScript({
    src: '/depot.dll.js',
  });
}
