import { join } from 'path';
import { existsSync } from 'fs';
var JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];
export default function(baseDir, fileNameWithoutExtname) {
  for (var _i = 0, _JS_EXTNAMES = JS_EXTNAMES; _i < _JS_EXTNAMES.length; _i++) {
    var extname = _JS_EXTNAMES[_i];
    var fileName = ''.concat(fileNameWithoutExtname).concat(extname);
    var absFilePath = join(baseDir, fileName);

    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }

  return null;
}
