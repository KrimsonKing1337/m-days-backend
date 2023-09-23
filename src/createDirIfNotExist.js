const fs = require('fs-extra');

/**
 *
 * @param path {string}
 */
function createDirIfNotExist(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

module.exports = createDirIfNotExist;
