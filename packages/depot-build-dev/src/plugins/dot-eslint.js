import chokidar from 'chokidar';
import { join } from 'path';
import { existsSync } from 'fs';
import signale from 'signale';
export default function(api) {
  const { debug, paths } = api;
  const { cwd } = paths;
  function watch() {
    if (process.env.WATCH_FILES === 'none') return;
    if (process.env.ESLINT === 'none') return;
    let fileName =  '.eslintrc';
    let cfgFile = join(cwd, fileName);
    if (!existsSync(cfgFile)) {
      return;
    }
    const watcher = chokidar.watch(
      [join(cwd, fileName)]
      ,
      {
        ignoreInitial: true,
      },
    );
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, load error`);
      signale.success(`${fileName} parse success`);
      api.restart();
      // api.applyPlugins('chainWebpackConfig')
      // api.rebuildTmpFiles('config dva changed');
    });
  }

  api.onDevCompileDone(() => {
    if (process.env.NODE_ENV === 'development') {
      watch();
    }
  });
}