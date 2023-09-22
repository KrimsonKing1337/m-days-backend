const GLOBALS = require('dot-globals')();
const gm = require('gm');
const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');

const Img = require('./Img');
const Dir = require('./Dir');
const File = require('./File');

const randomString = require('./randomString');
const getMaxWidth = require('./getMaxWidth');

const ep = new exiftool.ExiftoolProcess(exiftoolBin);

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
  constructor({ imgsSrcPath, imgsPath } = {}) {
    this.imgsSrcPath = imgsSrcPath;
    this.imgsPath = imgsPath;
    this.allowSizes = [640, 1280, 1600, 1920, 2560, 3840, 5210, 7680];
    this.allowFormats = ['bmp', 'gif', 'jng', 'jp2', 'jpc', 'jpeg', 'jpg', 'png', 'ptif', 'tiff'];
  }

  /**
   * @private
   * @returns {Array}
   */
  getImages() {
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
  makeEmptyTargetDir() {
    Dir.makeEmpty(this.imgsPath);
  }

  /**
   * @private
   * @param img {object}
   * @property img.fullPath {string}
   * @returns {object}
   */
  async formatTarget(img) {
    const info = {};
    const sizes = [];

    info.size = Img.getInfo(img.fullPath, 'size');
    info.format = Img.getInfo(img.fullPath, 'format');

    const width = info.size.width;
    const height = info.size.height;
    const delta = (width / height);

    if (width < 640) {
      console.log(`${img.fullPath} is too small, skipped;`);

      return 'tooSmall';
    }

    if (delta < 1 || delta > 2) {
      const squareImg = ConvertImgs.makeItSquare({
        img,
        size: info.size
      });

      if (squareImg !== false) {
        img = squareImg;

        console.log(`${img.fullPath} was cropped to square;`);
      } else {
        console.log(`${img.fullPath} is not valid due ratio;`);
      }
    }

    const maxWidth = getMaxWidth(width);

    this.allowSizes.forEach((widthCur) => {
      if (maxWidth >= widthCur) {
        sizes.push(widthCur);
      }
    });

    return {
      img,
      sizes
    };
  }

  /**
   * @private
   * @param images[] {object}; collection of images
   * @returns {object[]};
   */
  formatEachTarget(images) {
    const targets = [];

    images.forEach((imgCur) => {
      const formattedTarget = this.formatTarget(imgCur);

      targets.push(formattedTarget);
    });

    return targets.filter((targetCur) => targetCur !== 'tooSmall');
  }

  /**
   * @private
   * @param targets[] {object}; collection of targets
   * @returns {void}
   */
  convertEachTarget(targets) {
    targets.forEach((targetCur) => {
      this.convertTargetEachSize(targetCur);
    });
  }

  /**
   * @property target {object}
   * @property target.img {object}
   * @property target.img.fullPath {string}
   * @property target.img.nameWithoutExt {string}
   * @property target.size {object}
   * @returns {string || false}
   */
  static makeItSquare({ img, size } = {}) {
    const cropVal = size.height < size.width ? size.height : size.width;

    gm(img.fullPath)
      .gravity('Center')
      .crop(cropVal, cropVal)
      .write(img.fullPath, (err) => {
        if (err) {
          throw err;
        }

        const size = Img.getInfo(img.fullPath, 'size');

        if (size.width < 640) {
          return false;
        } else {
          return File.getInfo(img.fullPath);
        }
      });
  }

  /**
   * @param target {object}
   * @property target.img {object}
   * @property target.sizes {string[]}
   */
  convertTargetEachSize({ img, sizes } = {}) {
    // todo: too small images break the system (as example: Слава Скорокин -> DLoD_Bdzkuc.jpg)

    sizes.forEach((sizeCur) => {
      const newName = randomString();
      const imgCurTargetDir = `${this.imgsPath}/${sizeCur}`;
      const newFullName = `${imgCurTargetDir}/${newName}.jpg`;

      Dir.checkExist(imgCurTargetDir);

      this.convert({
        img,
        size: sizeCur,
        newName,
        newFullName,
      });
    });
  }

  /**
   * @private
   * @param img {object}
   * @property img.fullPath {string}
   * @property img.name {string}
   * @property img.ext {string}
   * @param size {string}
   * @param newName {string}
   * @param newFullName {string}
   * @returns {void}
   */
  convert({ img, size, newName, newFullName } = {}) {
    gm(img.fullPath)
      .channel('gray')
      .resize(size)
      .quality(75)
      .write(newFullName, async (err) => {
        if (err) {
          throw err;
        }

        try {
          await ConvertImgs.removeMetaData(newFullName);

          console.log(`meta was removed from ${size}/${newName}.jpg;`);
        } catch (err) {
          console.error(err);
        }
      });

    console.log(`${img.name} converted to ${size}/${newName}.jpg;`);
  }

  /**
   *
   * @param img {string}; full path
   */
  static removeMetaData(img) {
    return new Promise(((resolve, reject) => {
      ep
        .open()
        .then(() => ep.writeMetadata(
          img,
          { all: '' },
          ['overwrite_original'],
          false)
        )
        .then(() => ep.close())
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    }));
  }

  start() {
    this.makeEmptyTargetDir();

    const images = this.getImages();
    const targets = this.formatEachTarget(images);

    this.convertEachTarget(targets);

    console.log('done');
  }
}

const convert = new ConvertImgs({
  imgsSrcPath: GLOBALS.imgsSrcPath,
  imgsPath: GLOBALS.imgsPath
});

convert.start();
