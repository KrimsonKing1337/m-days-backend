const fs = require('fs');
const path = require('path');
const Dir = require('./Dir');
const randomString = require('./randomString');

class File {
  constructor() {

  }

  /**
   *
   * @param pathFile {string}
   */
  static checkSafeName(pathFile) {
    let newName;

    const fileInfo = File.getInfo(pathFile);
    const name = fileInfo.name;
    const result = name.replace(/[^a-zA-Z0-9_\-]+/g, '').replace(fileInfo.ext, '');

    if (result.length === 0) {
      newName = randomString();
    } else {
      newName = result;
    }

    if (newName !== name) {
      fs.renameSync(pathFile, `${fileInfo.fullPathWithoutName}/${newName}.${fileInfo.ext}`);
    }
  }

  /**
   *
   * @param pathDir {string}
   * @param fileName {string}
   */
  static checkTheSameFileInDir({ pathDir, fileName } = {}) {
    const filesList = Dir.ls(pathDir);

    return filesList.some((fileCur) => {
      return fileCur === fileName;
    });
  }

  /**
   *
   * @param pathFile {string}
   */
  static getInfo(pathFile) {
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
}

module.exports = File;
