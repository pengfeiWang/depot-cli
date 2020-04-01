import { join, relative } from 'path';
import { deprecate } from 'depot-utils';
export default function(api) {
  var options =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  deprecate('depot-plugin-polyfills', 'use config.targets instead.');
  var paths = api.paths;
  api.addEntryPolyfillImports(function() {
    return ['ie9', 'ie10', 'ie11']
      .filter(function(key) {
        return options.includes(key);
      })
      .map(function(key) {
        return {
          source: relative(
            paths.absTmpDirPath,
            join(__dirname, ''.concat(key, '.js')),
          ),
        };
      });
  });
}
