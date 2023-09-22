const fs = require('fs-extra');

const random = require('./randomInteger');

/**
 *
 * @param path
 * @returns {string}
 */
module.exports = function(path) {
    let oldFile;

    function randomFile() {
        const files = fs.readdirSync(path);
        const file = files[random(0, files.length - 1)];

        if (file === oldFile) {
            randomFile();
        } else {
           return file;
        }
    }

    return randomFile();
};
