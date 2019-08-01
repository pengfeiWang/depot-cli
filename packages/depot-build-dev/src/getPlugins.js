import resolve from 'resolve';
import assert from 'assert';
import chalk from 'chalk';
import { join } from 'path';
import { winPath } from 'depot-utils';
import registerBabel, { addBabelRegisterFiles } from './registerBabel';
import isEqual from './isEqual';
import getCodeFrame from './utils/getCodeFrame';

const debug = require('debug')('build-dev:getPlugin');

export default function(opts = {}) {
  const { cwd, plugins = [] } = opts;

  // 内置插件
  const builtInPlugins = [
    './plugins/commands/dev',
    './plugins/commands/build',
    './plugins/commands/cli',
    // './plugins/commands/inspect',
    './plugins/commands/test',
    './plugins/commands/help',
    './plugins/commands/version',
    './plugins/global-js',
    './plugins/global-css',
    './plugins/base',
    // './plugins/mountElementId',
    './plugins/mock',
    './plugins/dot-env',
    './plugins/dot-eslint',
    './plugins/proxy',
    './plugins/history',
    './plugins/afwebpack-config',
    './plugins/mountElementId',
    './plugins/404', // 404 must after mock
    // './plugins/atoolMonitor',
    './plugins/targets',
  ];

  const pluginsObj = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      let opts;
      if (Array.isArray(p)) {
        opts = p[1]; // eslint-disable-line
        p = p[0];
      }

      const apply = require(p); // eslint-disable-line
      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts,
      };
    }),
    ...getUserPlugins(
      process.env.DEPOT_PLUGINS ? process.env.DEPOT_PLUGINS.split(',') : [],
      { cwd },
    ),
    ...getUserPlugins(plugins, { cwd }),
  ];

  debug(`plugins: \n${pluginsObj.map(p => `  ${p.id}`).join('\n')}`);
  return pluginsObj;
}

function pluginToPath(plugins, { cwd }) {
  return (plugins || []).map(p => {
    assert(
      Array.isArray(p) || typeof p === 'string',
      `Plugin config should be String or Array, but got ${chalk.red(typeof p)}`,
    );
    if (typeof p === 'string') {
      p = [p];
    }
    let [path, opts] = p;
    let oldPath = path;

    try {
      if (path === 'depot-plugin-react') {
        opts = Object.assign(
          {
            dva: true,
            antd: true,
            fastClick: true,
          },
          opts,
        );

        return [
          resolve.sync('depot-plugin-react', {
            basedir: join(__dirname, '../'),
          }),
          // winPath(join(__dirname, `../node_modules/${path}`))),
          opts,
        ];
      }
      return [
        resolve.sync(path, {
          basedir: cwd,
        }),
        opts,
      ];
    } catch (e) {
      throw new Error(
        `
Plugin ${chalk.underline.cyan(oldPath)} can't be resolved

   Please try the following solutions:

     1. checkout the plugins config in your config file (.depotrc.js)
     ${
       path.charAt(0) !== '.' && path.charAt(0) !== '/'
         ? `2. install ${chalk.underline.cyan(oldPath)} via npm/yarn`
         : ''
     }
`.trim(),
      );
    }
  });
}

function getUserPlugins(plugins, { cwd }) {
  const pluginPaths = pluginToPath(plugins, { cwd });

  // 用户给的插件需要做 babel 转换
  if (pluginPaths.length) {
    addBabelRegisterFiles(pluginPaths.map(p => p[0]));
    registerBabel({
      cwd,
    });
  }

  return pluginPaths.map(p => {
    let [path, opts] = p;
    let apply;
    let oldPath = path;

    try {
      apply = require(path); // eslint-disable-line
    } catch (e) {
      throw new Error(
        `
Plugin ${chalk.cyan.underline(oldPath)} require failed

${getCodeFrame(e)}
      `.trim(),
      );
    }
    return {
      id: path.replace(makesureLastSlash(cwd), 'user:'),
      apply: apply.default || apply,
      opts,
    };
  });
}

function resolveIdAndOpts({ id, opts }) {
  return { id, opts };
}

function toIdStr(plugins) {
  return plugins.map(p => p.id).join('^^');
}

/**
 * 返回结果：
 *   pluginsChanged: true | false
 *   optionChanged: [ 'a', 'b' ]
 */
export function diffPlugins(newOption, oldOption, { cwd }) {
  const newPlugins = getUserPlugins(newOption, { cwd }).map(resolveIdAndOpts);
  const oldPlugins = getUserPlugins(oldOption, { cwd }).map(resolveIdAndOpts);

  if (newPlugins.length !== oldPlugins.length) {
    return { pluginsChanged: true };
  } else if (toIdStr(newPlugins) !== toIdStr(oldPlugins)) {
    return { pluginsChanged: true };
  } else {
    return {
      optionChanged: newPlugins.filter((p, index) => {
        return !isEqual(newPlugins[index].opts, oldPlugins[index].opts);
      }),
    };
  }
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}
