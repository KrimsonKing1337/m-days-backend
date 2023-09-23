const path = require('path');

/**
 *
 * @param pathFile {string}
 */
function getFileInfo(pathFile) {
  const name = path.basename(pathFile);
  const ext = path.extname(pathFile).toLowerCase();

  return {
    name,
    ext: ext.replace('.', ''),
    nameWithoutExt: name.replace(ext, ''),
    fullPath: pathFile,
    fullPathWithoutName: path.dirname(pathFile),
  };
}

module.exports = getFileInfo;
