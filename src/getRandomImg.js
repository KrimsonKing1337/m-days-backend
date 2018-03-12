const random = require('./randomInteger');
const Dir = require('./Dir');

let oldFile;

/**
 *
 * @param path
 * @returns {Promise<any>}
 */
module.exports = function (path) {
    return new Promise((resolve, reject) => {
        async function randomFile () {
            const files = await Dir.ls(path);
            const file = files[random(0, files.length - 1)];

            if (file === oldFile) {
                randomFile();
            } else {
                oldFile = file;
                resolve(file);
            }
        }

        randomFile();
    });
};