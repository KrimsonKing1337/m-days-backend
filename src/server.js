const GLOBALS = require('dot-globals')();
const getRandomImage = require('./getRandomImg');
//const mail = require('./mail');
const express = require('express');
const app = express();
const compression = require('compression');
const helmet = require('helmet');

const port = GLOBALS.port || 8080;
const rateLimit = require('express-request-limit');
const rateLimitOpts = {
    timeout: 1000 * 5,
    exactPath: true,
    cleanUpInterval: 0,
    errStatusCode: 429,
    errMessage: 'Too many requests made to this route'
};

if (!GLOBALS.buildPath) {
    console.error('buildPath does not specified!');

    return false;
}

function shouldCompress(req, res) {
    return true;
}

app.use(compression({filter : shouldCompress}));
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.disable('x-powered-by');
app.use(express.static(GLOBALS.buildPath)); //web root
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/bg', /*rateLimit(rateLimitOpts),*/ async (req, res) => {
    const screenWidth = req.query.screenWidth;
    const randomImage = await getRandomImage(`${GLOBALS.imgsRandomPath}/${screenWidth}`);

    res.send(`${screenWidth}/${randomImage}`);
});

/*app.post('/mail', async (req, res) => {
    if (req.body.text) {
        res.status(200).send('ok');

        mail({
            body: req.body,
            headers: req.headers
        });
    } else {
        res.status(400).send('Bad request');
    }

});*/

app.listen(port, () => {
    console.log(`We are live on ${port}`);
});