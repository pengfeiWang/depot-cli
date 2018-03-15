import slash from 'slash';
function winPath(path) {
  return slash(path);
}
import { sync as mkdirp } from 'mkdirp';
import { join, relative, basename } from 'path';
import { existsSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs';
import chalk from 'chalk';
import { copySync, removeSync } from 'fs-extra';

function error(message) {
  console.error(chalk.red(message));
}
function success(message) {
  console.error(chalk.green(message));
}

const cwd = process.cwd();

if (!process.argv[2]) {
  error('not input  directory');
  process.exit(1);
}
const directory = winPath(join(cwd, process.argv[2]));
const relativeDirectory = relative(cwd, directory);

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

if (existsSync(directory)) {
  error('The directory already exists');
  process.exit(1);
}
console.log(chalk.green(`Commands: cli `));
console.log(chalk.green(`  Create: ${directory}`));

copySync(winPath(join(__dirname, '../../template')), directory);
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
console.log(chalk.green(`  Create End`));

success(`
Success!

Inside that directory, you can run several commands:
  * npm start: Starts the development server.
  * npm run build: Bundles the app into dist for production.


We suggest that you begin by typing:
  ${chalk.blue.bold(`cd ${directory}`)}
  ${chalk.blue.bold('npm install && npm start')}`);
