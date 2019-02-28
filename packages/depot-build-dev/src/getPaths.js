import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function template(path) {
  return join(__dirname, '../template', path);
}

export default function(service) {
  const { cwd, config } = service;
  const outputPath = config.outputPath || './dist';

  let pagesPath = 'modules';
  if (process.env.PAGES_PATH) {
    pagesPath = process.env.PAGES_PATH;
  } else {
    if (test(join(cwd, 'src/modules'))) {
      pagesPath = 'src/modules';
    }

    if (test(join(cwd, 'modules'))) {
      pagesPath = 'modules';
    }
  }

  const absPagesPath = join(cwd, pagesPath);
  const absSrcPath = join(cwd, 'src');

  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`;
  const tmpDirPath = `.depot${envAffix}`;
  // const tmpDirPath = `${pagesPath}/.depot${envAffix}`;
  // const tmpDirPath = join(cwd, `.depot${envAffix}`);
  const absTmpDirPath = join(cwd, tmpDirPath);

  return {
    cwd,
    outputPath,
    absOutputPath: join(cwd, outputPath),
    absNodeModulesPath: join(cwd, 'node_modules'),
    pagesPath,
    absPagesPath,
    absSrcPath,
    tmpDirPath,
    absTmpDirPath,
    absRouterJSPath: join(absTmpDirPath, 'router.js'),
    absLibraryJSPath: join(absTmpDirPath, 'depot.js'),
    absRegisterSWJSPath: join(absTmpDirPath, 'registerServiceWorker.js'),
    // absPageDocumentPath: join(absPagesPath, 'document.ejs'),
    absPageDocumentPath: join(absSrcPath, 'document.ejs'),
    defaultEntryTplPath: template('entry.js.tpl'),
    defaultRouterTplPath: template('router.js.tpl'),
    defaultHistoryTplPath: template('history.js.tpl'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    // defaultDocumentPath: template('document.ejs'),
    defaultDocumentPath: join(cwd, 'src/index.ejs'),
  };
}
