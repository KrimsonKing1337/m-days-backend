const gm = require('gm');

class Img {
    constructor() {

    }

    /**
     *
     * @param path {string}
     * @param param {string}
     * @returns {Promise<any>}
     */
    static getInfo (path, param) {
        return new Promise((resolve, reject) => {
            gm(path)[param]((err, val) => {
                if (err) reject(err);

                resolve(val);
            });
        });
    }
}

module.exports = Img;