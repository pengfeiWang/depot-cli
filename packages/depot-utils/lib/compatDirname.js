import { dirname, join } from 'path';
import { existsSync } from 'fs';
export default function(path, cwd, fallback) {
  var pkg = findPkg(path, cwd);
  if (pkg) return pkg;

  if (cwd !== process.cwd()) {
    var _pkg = findPkg(path, process.cwd());

    if (_pkg) return _pkg;
  }

  return fallback;
}

function findPkg(path, cwd) {
  var pkgPath = join(cwd, 'package.json');
  var library = path.split('/')[0];

  if (existsSync(pkgPath)) {
    var _require = require(pkgPath),
      _require$dependencies = _require.dependencies,
      dependencies =
        _require$dependencies === void 0 ? {} : _require$dependencies; // eslint-disable-line

    if (dependencies[library]) {
      var _pkgPath = dirname(join(cwd, 'node_modules', path));

      if (existsSync(_pkgPath)) {
        return _pkgPath;
      }
    }
  }
}
