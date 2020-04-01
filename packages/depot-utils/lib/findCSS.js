import { join } from 'path';
import { existsSync } from 'fs';
var CSS_EXTNAMES = ['.css', '.less', '.scss', '.sass'];
export default function(baseDir, fileNameWithoutExtname) {
  for (
    var _i = 0, _CSS_EXTNAMES = CSS_EXTNAMES;
    _i < _CSS_EXTNAMES.length;
    _i++
  ) {
    var extname = _CSS_EXTNAMES[_i];
    var fileName = ''.concat(fileNameWithoutExtname).concat(extname);
    var absFilePath = join(baseDir, fileName);

    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }

  return null;
}
