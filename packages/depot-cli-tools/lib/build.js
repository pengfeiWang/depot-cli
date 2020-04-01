function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
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

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === '[object Arguments]'
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

var babel = require('@babel/core');

var yParser = require('yargs-parser');

var _require = require('path'),
  join = _require.join,
  extname = _require.extname,
  sep = _require.sep;

var _require2 = require('fs'),
  existsSync = _require2.existsSync,
  statSync = _require2.statSync,
  readdirSync = _require2.readdirSync;

var assert = require('assert');

var log = require('./utils/log');

var slash = require('slash2');

var chalk = require('chalk');

var rimraf = require('rimraf');

var vfs = require('vinyl-fs');

var through = require('through2');

var chokidar = require('chokidar');

var cwd = process.cwd();
var pkgCount = null; // Init

var args = yParser(process.argv.slice(3));
var watch = args.w || args.watch;
var excludes = args.e;

function getBabelConfig() {
  var isBrowser =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var targets = isBrowser
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
            targets: targets,
          },
          isBrowser
            ? {
                modules: false,
              }
            : {},
        ),
      ],
    ].concat(
      _toConsumableArray(
        isBrowser ? [require.resolve('@babel/preset-react')] : [],
      ),
    ),
    plugins: [
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve('@babel/plugin-proposal-class-properties'),
    ],
  };
}

function addLastSlash(path) {
  return path.slice(-1) === '/' ? path : ''.concat(path, '/');
}

function transform() {
  var opts =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var content = opts.content,
    path = opts.path,
    pkg = opts.pkg,
    root = opts.root;
  assert(content, 'opts.content should be supplied for transform()');
  assert(path, 'opts.path should be supplied for transform()');
  assert(pkg, 'opts.pkg should be supplied for transform()');
  assert(root, 'opts.root should be supplied for transform()');
  assert(extname(path) === '.js', 'extname of opts.path should be .js');

  var _ref = pkg.depotTools || {},
    browserFiles = _ref.browserFiles;

  var isBrowser =
    browserFiles &&
    browserFiles.includes(
      slash(path).replace(''.concat(addLastSlash(slash(root))), ''),
    );
  var babelConfig = getBabelConfig(isBrowser);
  log.transform(
    chalk[isBrowser ? 'yellow' : 'blue'](
      ''.concat(slash(path).replace(''.concat(cwd, '/'), '')),
    ),
  );
  return babel.transform(content, babelConfig).code;
}

function build(dir) {
  var opts =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var cwd = opts.cwd,
    watch = opts.watch,
    pkgWebpack = opts.pkgWebpack;
  assert(dir.charAt(0) !== '/', 'dir should be relative');
  assert(cwd, 'opts.cwd should be supplied');
  var pkgPath = join(cwd, dir, 'package.json');
  assert(existsSync(pkgPath), 'package.json should exists');

  var pkg = require(pkgPath); // eslint-disable-line

  if (excludes) {
    if (!Array.isArray(excludes)) {
      excludes = excludes.split(',');
    }

    if (excludes.includes(pkg.name)) return;
  }

  var libDir = join(dir, 'lib');
  var srcDir = join(dir, 'src'); // clean

  rimraf.sync(join(cwd, libDir));

  function createStream(src) {
    assert(typeof src === 'string', 'src for createStream should be string');
    return vfs
      .src(
        [
          src,
          '!'.concat(join(srcDir, '**/fixtures/**/*')),
          '!'.concat(join(srcDir, '**/.*-production/**/*')),
          '!'.concat(join(srcDir, '**/*.test.js')),
          '!'.concat(join(srcDir, '**/*.e2e.js')),
        ],
        {
          allowEmpty: true,
          base: srcDir,
        },
      )
      .pipe(
        through.obj(function(f, env, cb) {
          if (
            extname(f.path) === '.js' &&
            !f.path.includes(''.concat(sep, 'templates').concat(sep))
          ) {
            f.contents = Buffer.from(
              transform({
                content: f.contents,
                path: f.path,
                pkg: pkg,
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
    var pkgWebpackPath = join(cwd, dir, 'webpackConfig.js');
    assert(existsSync(pkgWebpackPath), 'webpackConfig.js should exists');

    var webpackCfg = require(pkgWebpackPath); // eslint-disable-line

    var compiler = webpack(webpackCfg);

    var cb = function cb(err, st) {
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

  var stream = createStream(join(srcDir, '**/*'));
  stream.on('end', function() {
    pkgCount -= 1;

    if (pkgCount === 0 && process.send) {
      process.send('BUILD_COMPLETE');
    }

    if (pkgWebpack) {
      createWebpack();
    } // watch

    if (watch) {
      log.pending('start watch', srcDir);
      var watcher = chokidar.watch(join(cwd, srcDir), {
        ignoreInitial: true,
      });
      watcher.on('all', function(event, fullPath) {
        var relPath = fullPath.replace(join(cwd, srcDir), '');
        log.watch('['.concat(event, '] ').concat(join(srcDir, relPath)));
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
  var dirs = readdirSync(join(cwd, 'packages')).filter(function(dir) {
    return dir.charAt(0) !== '.';
  });
  pkgCount = dirs.length;
  dirs.forEach(function(pkg) {
    build('./packages/'.concat(pkg), {
      cwd: cwd,
      watch: watch,
    });
  });
} else {
  pkgCount = 1;
  build('./', {
    cwd: cwd,
    watch: watch,
  });
}
