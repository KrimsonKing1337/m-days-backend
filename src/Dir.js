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
     *
     * @param path {string}
     */
    static ls(path) {
        return new Promise(((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) throw err;
                resolve(files);
            });
        }));
    }

    static lsSync(path) {
        return fs.readdirSync(path);
    }

    /**
     * R = recursive
     * @param path {string}
     * @param [formats[]] {string}
     * @returns {Array}
     */
    static readDir ({path, formats = []}) {
        const allFiles = [];

        function R (path) {
            const files = Dir.lsSync(path);

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
     * @returns {Promise}
     */
    static empty (path) {
        return fs.emptyDir(path)
            .then(() => {
            console.log(`${path} is now empty;`);
        })
            .catch((err) => {
                throw err;
            });
    }
}

module.exports = Dir;