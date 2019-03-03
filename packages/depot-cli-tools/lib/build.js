'use strict';

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }),
      );
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const babel = require('@babel/core');

const yParser = require('yargs-parser');

const _require = require('path'),
  join = _require.join,
  extname = _require.extname,
  sep = _require.sep;

const _require2 = require('fs'),
  existsSync = _require2.existsSync,
  statSync = _require2.statSync,
  readdirSync = _require2.readdirSync;

const assert = require('assert');

const log = require('./utils/log');

const slash = require('slash2');

const chalk = require('chalk');

const rimraf = require('rimraf');

const vfs = require('vinyl-fs');

const through = require('through2');

const chokidar = require('chokidar');

const cwd = process.cwd();
let pkgCount = null; // Init

const args = yParser(process.argv.slice(3));
const watch = args.w || args.watch;
let excludes = args.e;

function getBabelConfig(isBrowser) {
  const targets = isBrowser
    ? {
        browsers: ['last 2 versions', 'IE >= 9'],
      }
    : {
        node: 6,
      };
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        _objectSpread(
          {
            targets,
          },
          isBrowser
            ? {
                modules: false,
              }
            : {},
        ),
      ],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve('@babel/plugin-proposal-class-properties'),
    ],
  };
}

function addLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}

function transform(opts = {}) {
  const content = opts.content,
    path = opts.path,
    pkg = opts.pkg,
    root = opts.root;
  assert(content, `opts.content should be supplied for transform()`);
  assert(path, `opts.path should be supplied for transform()`);
  assert(pkg, `opts.pkg should be supplied for transform()`);
  assert(root, `opts.root should be supplied for transform()`);
  assert(extname(path) === '.js', `extname of opts.path should be .js`);

  const _ref = pkg.depotTools || {},
    browserFiles = _ref.browserFiles;

  const isBrowser =
    browserFiles &&
    browserFiles.includes(
      slash(path).replace(`${addLastSlash(slash(root))}`, ''),
    );
  const babelConfig = getBabelConfig(isBrowser);
  log.transform(
    chalk[isBrowser ? 'yellow' : 'blue'](
      `${slash(path).replace(`${cwd}/`, '')}`,
    ),
  );
  return babel.transform(content, babelConfig).code;
}

function build(dir, opts = {}) {
  const cwd = opts.cwd,
    watch = opts.watch,
    pkgWebpack = opts.pkgWebpack;
  assert(dir.charAt(0) !== '/', `dir should be relative`);
  assert(cwd, `opts.cwd should be supplied`);
  const pkgPath = join(cwd, dir, 'package.json');
  assert(existsSync(pkgPath), 'package.json should exists');

  const pkg = require(pkgPath); // eslint-disable-line

  if (excludes) {
    if (!Array.isArray(excludes)) {
      excludes = excludes.split(',');
    }

    if (excludes.includes(pkg.name)) return;
  }

  const libDir = join(dir, 'lib');
  const srcDir = join(dir, 'src'); // clean

  rimraf.sync(join(cwd, libDir));

  function createStream(src) {
    assert(typeof src === 'string', `src for createStream should be string`);
    return vfs
      .src(
        [
          src,
          `!${join(srcDir, '**/fixtures/**/*')}`,
          `!${join(srcDir, '**/.*-production/**/*')}`,
          `!${join(srcDir, '**/*.test.js')}`,
          `!${join(srcDir, '**/*.e2e.js')}`,
        ],
        {
          allowEmpty: true,
          base: srcDir,
        },
      )
      .pipe(
        through.obj((f, env, cb) => {
          if (
            extname(f.path) === '.js' &&
            !f.path.includes(`${sep}templates${sep}`)
          ) {
            f.contents = Buffer.from(
              transform({
                content: f.contents,
                path: f.path,
                pkg,
                root: join(cwd, dir),
              }),
            );
          }

          cb(null, f);
        }),
      )
      .pipe(vfs.dest(libDir));
  }

  function createWebpack() {
    const pkgWebpackPath = join(cwd, dir, 'webpackConfig.js');
    assert(existsSync(pkgWebpackPath), 'webpackConfig.js should exists');

    const webpackCfg = require(pkgWebpackPath); // eslint-disable-line

    const compiler = webpack(webpackCfg);

    const cb = (err, st) => {
      if (!err) {
        console.log(
          chalk.green('[webpack build done] '),
          'success : ',
          pkg.name + '.js',
        );
      }
    };

    if (watch) {
      compiler.watch(
        {
          aggregateTimeout: 300,
          poll: 1000,
        },
        cb,
      );
    } else {
      compiler.run(cb);
    }
  } // build

  const stream = createStream(join(srcDir, '**/*'));
  stream.on('end', () => {
    pkgCount -= 1;

    if (pkgCount === 0 && process.send) {
      process.send('BUILD_COMPLETE');
    }

    if (pkgWebpack) {
      createWebpack();
    } // watch

    if (watch) {
      log.pending('start watch', srcDir);
      const watcher = chokidar.watch(join(cwd, srcDir), {
        ignoreInitial: true,
      });
      watcher.on('all', (event, fullPath) => {
        const relPath = fullPath.replace(join(cwd, srcDir), '');
        log.watch(`[${event}] ${join(srcDir, relPath)}`);
        if (!existsSync(fullPath)) return;

        if (statSync(fullPath).isFile()) {
          createStream(fullPath);
        }
      });
    }
  });
}

function isLerna(cwd) {
  return existsSync(join(cwd, 'lerna.json'));
} // export default build;

if (isLerna(cwd)) {
  const dirs = readdirSync(join(cwd, 'packages')).filter(
    dir => dir.charAt(0) !== '.',
  );
  pkgCount = dirs.length;
  dirs.forEach(pkg => {
    build(`./packages/${pkg}`, {
      cwd,
      watch,
    });
  });
} else {
  pkgCount = 1;
  build('./', {
    cwd,
    watch,
  });
}
