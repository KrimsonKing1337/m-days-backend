const rootPath = require('app-root-path');

/**
 *
 * @param path {string}
 */
module.exports = function (path = `${rootPath}/.local`) {
    try {
        return require(path);
    } catch (err) {
        return false;
    }
};