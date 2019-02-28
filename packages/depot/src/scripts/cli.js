import yParser from 'yargs-parser';
import buildDevOpts from '../buildDevOpts';

process.env.NODE_ENV = 'development';

const args = yParser(process.argv.slice(2));
const Service = require('depot-build-dev/lib/Service').default;
new Service(buildDevOpts(args)).run('cli', args);
