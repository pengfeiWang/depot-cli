'use strict';

const _require = require('signale'),
  Signale = _require.Signale;

module.exports = new Signale({
  types: {
    transform: {
      badge: '🎅',
      color: 'blue',
      label: 'transform',
    },
    pending: {
      badge: '++',
      color: 'magenta',
      label: 'pending',
    },
    watch: {
      badge: '**',
      color: 'yellow',
      label: 'watch',
    },
  },
});
