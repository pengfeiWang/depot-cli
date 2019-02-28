import getConfig from 'af-webpack/getConfig';
import assert from 'assert';
// import path, { join } from 'path';
// import { winPath } from 'depot-utils';

export default function(service) {
  const { config } = service;

  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd,
    },
  });

  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );
  afWebpackOpts.chainConfig = webpackConfig => {
    service.applyPlugins('chainWebpackConfig', {
      args: webpackConfig,
      // dva: require('dva').default
    });

    if (config.chainWebpack) {
      config.chainWebpack(webpackConfig, {
        webpack: require('af-webpack/webpack'),
      });
    }
  };
  // console.log('getConfig(afWebpackOpts)::', getConfig(afWebpackOpts));
  
  // afWebpackOpts.alias.dva = require('dva');
  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig(afWebpackOpts),
  });
}
