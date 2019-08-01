'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _fs = require('fs');

var _assert = _interopRequireDefault(require('assert'));

var _chalk = _interopRequireDefault(require('chalk'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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

function _default(api) {
  const generators = api.service.generators,
    log = api.log;

  function generate(args = {}) {
    try {
      const name = args._[0];
      (0, _assert.default)(
        name,
        `run ${_chalk.default.cyan.underline(
          'depot help generate',
        )} to checkout the usage`,
      );
      (0, _assert.default)(
        generators[name],
        `Generator ${_chalk.default.cyan.underline(name)} not found`,
      );
      const _generators$name = generators[name],
        Generator = _generators$name.Generator,
        resolved = _generators$name.resolved;
      const generator = new Generator(
        args._.slice(1),
        _objectSpread({}, args, {
          env: {
            cwd: api.cwd,
          },
          resolved: resolved || __dirname,
        }),
      );
      return generator
        .run()
        .then(() => {
          log.success('');
        })
        .catch(e => {
          log.error(e);
        });
    } catch (e) {
      log.error(`Generate failed, ${e.message}`);
    }
  }

  function registerCommand(command, description) {
    const details = `
Examples:

  ${_chalk.default.gray('# generate page users')}
  depot generate page users

  ${_chalk.default.gray('# g is the alias for generate')}
  depot g page index

  ${_chalk.default.gray('# generate page with less file')}
  depot g page index --less
  `.trim();
    api.registerCommand(
      command,
      {
        description,
        usage: `depot ${command} type name [options]`,
        details,
      },
      generate,
    );
  }

  registerCommand('g', 'generate code snippets quickly (alias for generate)');
  registerCommand('generate', 'generate code snippets quickly');
  (0, _fs.readdirSync)(`${__dirname}/generators`)
    .filter(f => !f.startsWith('.'))
    .forEach(f => {
      api.registerGenerator(f, {
        Generator: require(`./generators/${f}`).default(api),
        resolved: `${__dirname}/generators/${f}/index`,
      });
    });
}
