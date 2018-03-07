import { resolve } from 'path';

const debug = require('debug')('depot:build');
process.env.NODE_ENV = 'production';

export default function(opts = {}) {
  const { extraResolveModules } = opts;
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;

  return require('../../build-dev/lib/build').default({
    // eslint-disable-line
    babel: resolve(__dirname, './babel'),
    extraResolveModules: [
      ...(extraResolveModules || []),
      resolve(__dirname, '../../node_modules'),
    ],
    hash: true,
    ...opts,
  });
}
