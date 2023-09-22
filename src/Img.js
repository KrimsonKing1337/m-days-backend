const gm = require('gm');

class Img {
  constructor() {

  }

  /**
   *
   * @param path {string}
   * @param param {string}
   * @returns {object}
   */
  static getInfo(path, param) {
    let value;

    gm(path)[param]((err, val) => {
      if (err) {
        throw err;
      }

      value = val;
    });

    return value;
  }
}

module.exports = Img;
