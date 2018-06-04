const GLOBALS = require('dot-globals')();
const gm = require('gm');
const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');
const ep = new exiftool.ExiftoolProcess(exiftoolBin);
const eachSeries = require('async/eachSeries');
const Img = require('./Img');
const Dir = require('./Dir');
const File = require('./File');
const randomString = require('./randomString');
const getMaxWidth = require('./getMaxWidth');

if (!GLOBALS.imgsSrcPath) {
    console.error('imgsSrcPath does not specified!');

    return false;
}

if (!GLOBALS.imgsPath) {
    console.error('imgsPath does not specified!');

    return false;
}

class ConvertImgs {
    /**
     *
     * @param imgsSrcPath {string}
     * @param imgsPath {string}
     */
    constructor ({imgsSrcPath, imgsPath} = {}) {
        this.imgsSrcPath = imgsSrcPath;
        this.imgsPath = imgsPath;
        this.allowSizes = [640, 1280, 1600, 1920, 2560, 3840, 5210, 7680];
        this.allowFormats = ['bmp', 'gif', 'jng', 'jp2', 'jpc', 'jpeg', 'jpg', 'png', 'ptif', 'tiff'];
    }

    /**
     * @private
     * @returns {Array}
     */
    getImages () {
        return Dir.readDir({
            path: this.imgsSrcPath,
            formats: this.allowFormats
        });
    }

    /**
     * @private
     * empty folder before convert.
     * it's need because of random name for
     * each new converted image.
     * so if not empty there will be many duplicate
     */
    emptyImgsDoneDir () {
        return Dir.empty(this.imgsPath);
    }

    /**
     * @private
     * @param img {object}
     * @param img.fullPath {string}
     * @returns {Promise}
     */
    async formatTarget (img) {
        const info = {};
        const sizes = [];

        info.size = await Img.getInfo(img.fullPath, 'size');
        info.format = await Img.getInfo(img.fullPath, 'format');

        const width = info.size.width;
        const height = info.size.height;
        const delta = (width / height);

        if (width < 640) {
            console.log(`${img.fullPath} is too small, skipped;`);
            return;
        }

        if (delta < 1 || delta > 2) {
            const tryToSquareResult = await ConvertImgs.tryToSquare({
                img,
                size: info.size
            });

            if (tryToSquareResult !== false) {
                img = tryToSquareResult;

                console.log(`${img.fullPath} was cropped to square;`);
            } else {
                console.log(`${img.fullPath} is not valid due ratio;`);
            }
        }

        const maxWidth = getMaxWidth(width);

        this.allowSizes.forEach((widthCur) => {
            if (maxWidth >= widthCur) sizes.push(widthCur);
        });

        const target = {
            img,
            sizes
        };

        return Promise.resolve(target);
    }

    /**
     * @private
     * @param images[] {object}; collection of images
     * @returns {Promise}
     */
    formatEachTarget (images) {
        const targetsPromisesArr = [];

        images.forEach((imgCur) => {
            targetsPromisesArr.push(this.formatTarget(imgCur));
        });

        return Promise.all(targetsPromisesArr);
    }

    /**
     * @private
     * @param targets[] {object}; collection of targets
     * @returns {Promise}
     */
    convertEachTarget (targets) {
        return new Promise((resolve, reject) => {
            /**
             * targets = collection to iterate over,
             * function (targetCur, next), next = iteration callback,
             * function (err) = last iteration callback
             */
            eachSeries(targets, (targetCur, next) => {
                const promise = this.convertTargetEachSize(targetCur);
                promise.then(() => {
                    next();
                });
            }, (err) => {
                if (err) throw err;

                resolve();
            });
        });
    }

    /**
     *
     * @param img {object}
     * @param img.fullPath {string}
     * @param img.nameWithoutExt {string}
     * @param size {object}
     * @returns {Promise}
     */
    static tryToSquare ({img, size} = {}) {
        const cropVal = size.height < size.width ? size.height : size.width;

        return new Promise(((resolve, reject) => {
            gm(img.fullPath).gravity('Center').crop(cropVal, cropVal)
                .write(img.fullPath, async (err) => {
                    if (err) throw err;

                    const size = await Img.getInfo(img.fullPath, 'size');

                    if (size.width < 640) {
                        resolve(false);
                    } else {
                        resolve(File.getInfo(img.fullPath));
                    }
                });
        }));
    }

    /**
     *
     * @param img {object}
     * @param img.fullPath {string}
     * @param img.name {string}
     * @param img.ext {string}
     * @param sizes[] {string}
     */
    convertTargetEachSize ({img, sizes} = {}) {
        if (!img) return Promise.resolve();
        //todo: too small images break the system (as example: Слава Скорокин -> DLoD_Bdzkuc.jpg)

        return new Promise((resolve, reject) => {
            /**
             * sizes = collection to iterate over,
             * function (targetCur, next), next = iteration callback,
             * function (err) = last iteration callback
             */
            eachSeries(sizes, (sizeCur, next) => {
                const newName = randomString();
                const imgCurDoneDir = `${this.imgsPath}/${sizeCur}`;
                const newFullName = `${imgCurDoneDir}/${newName}.jpg`;
                Dir.checkExist(imgCurDoneDir);

                this.convert({
                    img,
                    size: sizeCur,
                    newName,
                    newFullName
                }).then(() => {
                    next();
                });
            }, (err) => {
                if (err) throw err;

                console.log(`done with ${img.name};`);

                resolve();
            });
        });
    }

    /**
     * @private
     * @param img {object}
     * @param img.fullPath {string}
     * @param img.name {string}
     * @param img.ext {string}
     * @param size {string}
     * @param newName {string}
     * @param newFullName {string}
     * @returns {Promise<[any]>}
     */
    convert ({img, size, newName, newFullName} = {}) {
        return new Promise(((resolve, reject) => {
            gm(img.fullPath).channel('gray').resize(size).quality(75)
                .write(`${newFullName}`, async (err) => {
                    if (err) throw err;

                    try {
                        await ConvertImgs.removeMetaData(newFullName);

                        console.log(`meta was removed from ${size}/${newName}.jpg;`);
                    } catch (err) {
                        console.error(err);
                    }

                    console.log(`${img.name} converted to ${size}/${newName}.jpg;`);

                    resolve();
                });
        }));
    }

    /**
     *
     * @param img {string}; full path
     */
    static removeMetaData (img) {
        return new Promise(((resolve, reject) => {
            ep
                .open()
                .then(() => ep.writeMetadata(img, {all: ''}, ['overwrite_original']))
                .then(() => ep.close())
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        }));
    }

    async start () {
        await this.emptyImgsDoneDir();

        const images = this.getImages();
        const targets = await this.formatEachTarget(images);

        await this.convertEachTarget(targets);

        console.log('done');
    }
}

const convert = new ConvertImgs({
    imgsSrcPath: GLOBALS.imgsSrcPath,
    imgsPath: GLOBALS.imgsPath
});

convert.start();