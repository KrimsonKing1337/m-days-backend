/**
 *
 * @param count {number}
 * @returns {string}
 */
function randomString(count = 10) {
    let randomString = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    for (let i = 0; i < count; i++) {
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return randomString;
}

module.exports = randomString;
