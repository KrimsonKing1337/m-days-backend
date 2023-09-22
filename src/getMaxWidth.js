/**
 * @param width {number || string}
 */
module.exports = function (width) {
    if (typeof width === 'string') width = parseInt(width);

    if (width >= 640 && width < 1280) return 640;
    else if (width >= 1280 && width < 1600) return 1280;
    else if (width >= 1600 && width < 1920) return 1600;
    else if (width >= 1920 && width < 2560) return 1920;
    else if (width >= 2560 && width < 3840) return 2560;
    else if (width >= 3840 && width < 5210) return 3840;
    else if (width >= 5210 && width < 7680) return 5210;
    else if (width >= 7680) return 7680;
};
