// import yParser from 'yargs-parser';
import chalk from 'chalk';
// import { copyFileSync, unlinkSync, existsSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
import { winPath } from 'depot-utils';
import { join } from 'path';
import { copySync, removeSync, statSync, existsSync, readdirSync } from 'fs-extra';

export default function(api) {

  const script = process.argv[2];
  const directory = process.argv[3];
  
  function error(message) {
    console.error(chalk.red(`ERROR: ${message}`));
  }
  function success(message) {
    console.log(chalk.green(message));
  }
  
  function printFileName(f) {
    readdirSync(f).forEach(file => {
      if (file === '.DS_Store') {
        removeSync(winPath(join(directory, file)));
      } else {
        const filePath = winPath(join(f, file));
        const stats = statSync(filePath);
        if(stats.isDirectory()) {
          console.log(chalk.bold.green('  Create'), ' ' , `${f}/${file}`);
          printFileName(filePath);
          return;
        } else {
          console.log(chalk.bold.green('  Create'), ' ' , `${f}/${file}`);
        }
      }
    });
  }
  api.registerCommand(
    'cli',
    {
      description: '[alpha] update config via cli',
      options: {},
    },
    () => {
      if (!directory) {
        error('not input directory');
        process.exit(1);
      }
      if (existsSync(directory)) {
        error('The directory already exists');
        process.exit(1);
      }
      
      console.log(chalk.green(`Commands: cli `));
      console.log(chalk.green(`  Create directory [${directory}]`));
      
      
      copySync(winPath(join(__dirname, '../../../template/cli-template')), directory);
      removeSync(winPath(join(directory, '.DS_Store')));
      readdirSync(directory).forEach(file => {
        const filePath = winPath(join(directory, file));
        const stats = statSync(filePath);
        if (file === '.DS_Store') {
          removeSync(winPath(join(directory, file)));
        } else {
          console.log(chalk.bold.green('  Create'), ' ' , file);
          if(stats.isDirectory()) {
            printFileName(filePath);
            return;
          }
        }
      });

success(`
Success!

Inside that directory, you can run several commands:
  * npm start: Starts the development server.
  * npm run build: Bundles the app into dist for production.


We suggest that you begin by typing:
  ${chalk.blue.bold(`cd ${directory}`)}
  ${chalk.blue.bold('npm install && npm start')}`);

    },
  );
}
