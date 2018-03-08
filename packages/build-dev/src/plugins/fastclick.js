export default function(api) {
  const { IMPORT } = api.placeholder;
  const { libraryName } = api.service;
  api.register('modifyEntryFile', ({ memo }) => {
    memo = memo.replace(
      IMPORT,
      `
import FastClick from '${libraryName}-fastclick';
${IMPORT}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    FastClick.attach(document.body);
  },
  false,
);
    `.trim(),
    );
    return memo;
  });

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    // 期一个带 umi 前缀的别名，是为了后面可以修改他
    memo.alias[`${libraryName}-fastclick`] = require.resolve('fastclick');
    return memo;
  });
}
