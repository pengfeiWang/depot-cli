import { dirname } from 'path';
import yParser from 'yargs-parser';
import signale from 'signale';
import semver from 'semver';
import buildDevOpts from './buildDevOpts';

let script = process.argv[2];
const args = yParser(process.argv.slice(3));

// Node version check
const nodeVersion = process.versions.node;
if (semver.satisfies(nodeVersion, '<6.5')) {
  signale.error(`Node version must >= 6.5, but got ${nodeVersion}`);
  process.exit(1);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

process.env.DEPOT_DIR = dirname(require.resolve('../package'));
process.env.DEPOT_VERSION = pkg.version;

const aliasMap = {
  '-v': 'version',
  '--version': 'version',
  '-h': 'help',
  '--help': 'help',
};

switch (script) {
  case 'build':
  case 'dev':
  case 'cli':
  // case 'test':
  // case 'inspect':
    require(`./scripts/${script}`); // eslint-disable-line
    break;
  default: {
    const Service = require('depot-build-dev/lib/Service').default; // eslint-disable-line
    new Service(buildDevOpts(args)).run(aliasMap[script] || script, args);
    break;
  }
}
