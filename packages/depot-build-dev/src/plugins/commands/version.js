import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export default api => {
  api.registerCommand(
    'version',
    {
      description: 'show related versions',
    },
    args => {
      const pkg = require(join(process.env.DEPOT_DIR, 'package.json'));
      if (args.verbose) {
        const versions = api.applyPlugins('addVersionInfo', {
          initialValue: [
            `depot@${pkg.version}`,
            `${process.platform} ${process.arch}`,
            `node@${process.version}`,
            `depot-build-dev@${require('../../../package').version}`,
            `af-webpack@${require('af-webpack/package').version}`,
            `depot-babel-preset@${require('depot-babel-preset/package').version}`,
            // `umi-test@${require('umi-test/package').version}`,
          ],
        });
        versions.forEach(version => {
          console.log(version);
          
        });
      } else {
        //console.log(pkg.version);
        console.log(`depot-cli: ${pkg.version}
platform: ${process.platform} ${process.arch}
node: ${process.version}
        `)
      }
      if (existsSync(join(process.env.DEPOT_DIR, '.local'))) {
        console.log(chalk.cyan('@local'));
      }
    },
  );
};
