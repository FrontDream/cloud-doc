## 启动

- 拉取react脚手架代码：`npx create-react-app my-app`
- 安装electron: `cnpm install electron --save-dev`
- 项目根目录下新建`main.js`，并且在package.json中增加"main"入口：
  ```json
    "main": "main.js",
```
- 安装判断是否是本地开发的小工具：`cnpm install electron-is-dev`
```javascript
const { app ,BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')

let mainWindow;

app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true
        }
    })
    const urlLocation = isDev?'http://localhost:3000': 'ddd'
    mainWindow.loadURL(urlLocation)
})
```
- 安装同时运行两个命令的包：`npm install concurrently --save`
- 修改package.json为如下，但是因为这是同时运行的，但是正常来说是前一个命令运行起来，再运行后一个命令
```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "ele": "electron .",
    "dev": "concurrently \"npm start\" \"npm run ele\""
  }
```
- 因此需要再安装一个小工具：`cnpm install wait-on --save-dev`。并修改package.json如下：
```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "ele": "electron .",
    "dev": "concurrently \"npm start\" \"wait-on http://localhost:3000 && electron .\""
  },
```
- 但是这样同时还会打开浏览器，为了不打开浏览器，可以设置BROWSER为none，但是有跨平台的问题，因此可以再安装一个跨平台的工具，用于设置环境变量：`cnpm install cross-env --save-dev`,并修改package.json修改为如下：
```json
 "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "ele": "electron .",
    "dev": "concurrently \"cross-env BROWSER=none npm start\" \"wait-on http://localhost:3000 && electron .\""
  },
```
## 打包过程

- 安装`electron-builder`: npm install electron-builder --save-dev
- 项目根目录运行`npm run build`
- 修改非开发环境下electron运行的本地地址：`const urlLocation = isDev?'http://localhost:3000': `file://${path.join(__dirname, './build/index.html')}` `
- 在`package.json`中添加基本配置，package.json第一层添加如下代码：
```json
"author": {
    "name": "qiandingwei",
    "email": "1370336125@qq.com"
},
"build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2020 ${author}"
  },
```
- 在`script`中添加：
```javascript
"pack": "electron-builder --dir",
"prepack": "npm run build",
"dist": "electron-builder"
```
- 运行`npm run pack`
- [报错](https://blog.csdn.net/weixin_42826294/article/details/113590638)
- [报错](https://blog.csdn.net/weixin_42826294/article/details/113592301)
- [报错](https://blog.csdn.net/weixin_42826294/article/details/113595030)
- [报错](https://blog.csdn.net/weixin_42826294/article/details/113595862)