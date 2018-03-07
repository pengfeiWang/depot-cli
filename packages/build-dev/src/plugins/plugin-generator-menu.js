// import assert from 'assert';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join/* , dirname, basename, relative */ } from 'path';
// import globby from 'globby';


export default function(api) {
  const { paths } = api.service;
  const { absTmpDirPath } = paths;
  const menuContainerPath = join(absTmpDirPath, 'menu.js');

  function getMenuJSContent(menuData) {
    if (!menuData) return [];
    const ret = [];
    menuData.forEach((it) => {
      const cloneIt = { ...it };
      delete cloneIt.component;
      ret.push(JSON.stringify(cloneIt));
    });
    return ret.join(',\r\n  ');
  }

  api.register('modifyRoutes', ({ memo }) => {
    const tpl = join(__dirname, '../../template/menu.js');
    if (!existsSync(absTmpDirPath)) {
      return;
    }
    let tplContent = readFileSync(tpl, 'utf-8');
    tplContent = tplContent
      .replace('<%= menuContent %>', getMenuJSContent(memo));
    writeFileSync(menuContainerPath, tplContent, 'utf-8');
  });
}
