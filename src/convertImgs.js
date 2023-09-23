const GLOBALS = require('dot-globals')();
const sharp = require('sharp');

const randomString = require('./randomString');
const getMaxWidth = require('./getMaxWidth');
const readDir = require('./readDirSync.js');
const createDirIfNotExist = require('./createDirIfNotExist.js');
const removeDir = require('./removeDir.js');

if (!GLOBALS.imagesSourcesPath) {
  console.error('imagesSourcesPath does not specified!');

  process.exit(-1);
}

if (!GLOBALS.imagesTargetPath) {
  console.error('imagesTargetPath does not specified!');

  process.exit(-1);
}

if (!GLOBALS.imagesTempPath) {
  console.error('imagesTempPath does not specified!');

  process.exit(-1);
}

// todo: исключить аватары фотографов

class ConvertImages {
  /**
   *
   * @param imagesSourcesPath {string}
   * @param imagesTargetPath {string}
   * @param imagesTempPath {string}
   */
  constructor({ imagesSourcesPath, imagesTargetPath, imagesTempPath } = {}) {
    this.imagesSourcesPath = imagesSourcesPath;
    this.imagesTargetPath = imagesTargetPath;
    this.tempPath = imagesTempPath;

    this.allowSizes = [640, 1280, 1600, 1920, 2560, 3840, 5210, 7680];
    this.allowFormats = ['bmp', 'gif', 'jng', 'jp2', 'jpc', 'jpeg', 'jpg', 'png', 'ptif', 'tiff'];
  }

  /**
   * @private
   * @returns {Array}
   */
  getImages() {
    return readDir({
      path: this.imagesSourcesPath,
      formats: this.allowFormats
    });
  }

  /**
   * @private
   * @param img {object}
   * @property img.fullPath {string}
   * @returns {object || null}
   */
  async formatTarget(img) {
    let formattedImg = img;
    const sizes = [];

    const meta = await sharp(img.fullPath).metadata();

    const { width, height } = meta;

    formattedImg.size = {
      width,
      height,
    };

    const delta = (width / height);

    if (width < 640) {
      console.log(`${img.fullPath} is too small, skipped;`);

      return null;
    }

    if (delta < 1 || delta > 2) {
      const squareImg = await this.makeItSquare(formattedImg);

      if (squareImg !== false) {
        formattedImg = squareImg;

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
      img: formattedImg,
      sizes,
    };
  }

  /**
   * @private
   * @param images[] {object}; collection of images
   * @returns {Promise<object[]>};
   */
  async formatEachTarget(images) {
    const targets = [];

    for (const imgCur of images) {
      const formattedTarget = await this.formatTarget(imgCur);

      targets.push(formattedTarget);
    }

    return targets.filter((targetCur) => targetCur !== null);
  }

  /**
   * @private
   * @param targets[] {object}; collection of targets
   */
  async convertEachTarget(targets) {
    for (const targetCur of targets) {
      await this.convertTargetEachSize(targetCur);
    }
  }

  /**
   * @property img {object}
   * @property img.fullPath {string}
   * @property img.nameWithoutExt {string}
   * @property img.size {object}
   * @returns {string || false}
   */
  async makeItSquare(img) {
    const { size } = img;

    const cropVal = size.height < size.width ? size.height : size.width;

    if (cropVal < 640) {
      return false;
    }

    const newName = randomString();
    const imgCurTargetDir = this.tempPath;
    const newFullName = `${imgCurTargetDir}/${newName}.jpg`;

    createDirIfNotExist(imgCurTargetDir);

    await sharp(img.fullPath)
      .resize({ width: cropVal, height: cropVal, fit: 'cover' })
      .toFile(newFullName);

    const newSize = { width: cropVal, height: cropVal };

    return {
      ...img,
      size: newSize,
      fullPath: newFullName,
    };
  }

  /**
   * @param target {object}
   * @property target.img {object}
   * @property target.sizes {string[]}
   */
  async convertTargetEachSize({ img, sizes } = {}) {
    for (const sizeCur of sizes) {
      const newName = randomString();
      const imgCurTargetDir = `${this.imagesTargetPath}/${sizeCur}`;
      const newFullName = `${imgCurTargetDir}/${newName}.jpg`;

      createDirIfNotExist(imgCurTargetDir);

      await this.convert({
        img,
        size: sizeCur,
        newName,
        newFullName,
      });
    }
  }

  /**
   * @param img {object}
   * @property img.fullPath {string}
   * @property img.name {string}
   * @property img.ext {string}
   * @param size {string}
   * @param newName {string}
   * @param newFullName {string}
   */
  async convert({ img, size, newName, newFullName } = {}) {
    const width = Number(size);

    await sharp(img.fullPath)
      .grayscale()
      .resize({ width })
      .toFile(newFullName);

    console.log(`${img.name} converted to ${size}/${newName}.jpg;`);
  }

  async start() {
    removeDir(this.imagesTargetPath);
    createDirIfNotExist(this.imagesTargetPath);

    const images = this.getImages();

    // убираю аватарки фотографов
    const imagesWithoutAvatars = images.filter((imgCur) => {
      const { name } = imgCur;

      return !name.includes('avatar');
    });

    const targets = await this.formatEachTarget(imagesWithoutAvatars);

    await this.convertEachTarget(targets);

    removeDir(this.tempPath);

    console.log('done');
  }
}

const convert = new ConvertImages({
  imagesSourcesPath: GLOBALS.imagesSourcesPath,
  imagesTargetPath: GLOBALS.imagesTargetPath,
  imagesTempPath: GLOBALS.imagesTempPath,
});

convert.start();
