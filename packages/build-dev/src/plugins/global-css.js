import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;

  api.register('modifyRouterFile', ({ memo }) => {
    const cssImports = [
      paths.absGlobalStyle,
    ]
      .filter(f => existsSync(f))
      .map(f => `import('${winPath(relative(paths.tmpDirPath, f))}');`);

    if (cssImports.length) {
      return memo.replace(
        IMPORT,
        `
${cssImports.join('\r\n')}
${IMPORT}
          `.trim(),
      );
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [
      ...memo,
      paths.absGlobalStyle,
    ];
  });
}
