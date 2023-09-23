const fs = require('fs');

/**
 *
 * @param dirPath {string}
 */
function removeDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

module.exports = removeDir;
