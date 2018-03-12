//todo: заливаем файлы, отправляем их по почте, для заливки файлов использовать multer

const nodemailer = require('nodemailer');

let mailLocalOptions;

try {
    mailLocalOptions = require('./mail.local');
} catch (err) {
    throw err;
}

/**
 *
 * @param body {object}
 * @param headers {object}
 */
module.exports = function ({body, headers} = {}) {
    const smtpTransport = nodemailer.createTransport({
        host: 'cpanel6.d.fozzy.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'm-days@m-days.ru',
            pass: mailLocalOptions.pass
        }
    });

    const attachmentsParsed = [];

    body.attachments.forEach((item, i) => {
        attachmentsParsed.push({
            filename: item.filename,
            content: item.path,
            encoding: 'base64'
        });
    });

    const mailOptions = {
        from: '"m-days no-reply" <m-days@m-days.ru>', // sender address
        to: 'shilov-1@yandex.ru', // list of receivers
        subject: 'Photos', // Subject line
        text: body.text
        //attachments: attachmentsParsed
    };

    smtpTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
            return console.error(err);
        }

        smtpTransport.close();
    });
};
