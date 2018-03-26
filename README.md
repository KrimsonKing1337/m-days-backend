# m-days-backend

# How to install

**Install [GraphicsMagick](http://www.graphicsmagick.org)**

Windows: https://sourceforge.net/projects/graphicsmagick/files/graphicsmagick-binaries/1.3.27/

Unix-like: http://www.graphicsmagick.org/INSTALL-unix.html

PPA: 
```
sudo add-apt-repository ppa:dhor/myway
sudo apt-get update
sudo apt-get install graphicsmagick
```

Create file with local variables 
(by default ${root}/.local.js)
and set them.

You need to specify 
```port```,
```imgsSrcPath```,
```imgsPath```,
```imgsRandomPath```,
```buildPath```
at least.

Then install node dependencies ```npm i```,

make convert ```npm run convert``` 

and start server ```npm run start```.