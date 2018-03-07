'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

function _default(api) {
  const _api$placeholder = api.placeholder,
    IMPORT = _api$placeholder.IMPORT,
    HISTORY_MODIFIER = _api$placeholder.HISTORY_MODIFIER;
  const config = api.service.config;
  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'hashHistory',

        onChange() {
          api.service.restart(
            /* why */
            'Config hashHistory Changed',
          );
        },
      };
    });
    return memo;
  });

  if (config.hashHistory) {
    api.register('modifyEntryFile', ({ memo }) => {
      return memo
        .replace(
          IMPORT,
          `
import createHashHistory from 'history/createHashHistory';
${IMPORT}
        `.trim(),
        )
        .replace(
          HISTORY_MODIFIER,
          `
window.g_history = createHashHistory();
${HISTORY_MODIFIER}
        `.trim(),
        );
    });
  }
}
