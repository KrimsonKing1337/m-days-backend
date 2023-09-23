const fs = require('fs-extra');
const File = require('./File');

class Dir {
  constructor() {

  }

  /**
   *
   * @param path {string}
   */
  static checkExist(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  /**
   * R = recursive
   * @param path {string}
   * @param [formats[]] {string}
   * @returns {Array}
   */
  static readDir({ path, formats = [] }) {
    const allFiles = [];

    function R(path) {
      const files = fs.readdirSync(path);

      files.forEach((fileCur) => {
        const fileCurFullPath = `${path}/${fileCur}`;
        const stats = fs.statSync(fileCurFullPath);

        if (stats.isFile()) {
          const fileInfo = File.getInfo(fileCurFullPath);

          if (formats.length === 0) {
            allFiles.push(fileInfo);

            return;
          }

          const formatIsOk = formats.some((formatCur) => {
            return formatCur.toLowerCase() === fileInfo.ext.toLowerCase();
          });

          if (formatIsOk === true) {
            allFiles.push(fileInfo);
          } else {
            console.log(`${fileCurFullPath} has wrong format, skip;`);
          }
        } else if (stats.isDirectory()) {
          R(fileCurFullPath);
        }
      });
    }

    R(path);

    return allFiles;
  }

  /**
   *
   * @param path {string}
   * @returns {void}
   */
  static makeEmpty(path) {
    fs.emptyDirSync(path);

    console.log(`${path} is now empty;`);
  }
}

module.exports = Dir;
