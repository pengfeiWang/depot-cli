import { resolve } from 'path';

const debug = require('debug')('depot:dev');
process.env.NODE_ENV = 'development';

export default function(opts = {}) {
  const { extraResolveModules } = opts;
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;

  return require('../../build-dev/lib/dev').default({
    // eslint-disable-line
    babel: resolve(__dirname, '../babel'),
    extraResolveModules: [
      ...(extraResolveModules || []),
      resolve(__dirname, '../../node_modules'),
    ],
    ...opts,
  });
}

export { fork } from '../../build-dev/lib/dev';
