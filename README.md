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

## 配置安装包

- 在package.json的build中配置打包过程中的静态图片,告诉electron-builder安装包所需静态文件的位置：
```javascript
"directories": {
      "buildResources": "assets"
    },
```

- 在package.json的build中添加win,mac,linux的配置

```json
"mac": {
      "category": "public.app-category.productivity",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi", "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "Viking Zhang"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
```

## 压缩优化体积

- 在安装包中有一个app.asar是体积过大的主要罪魁祸首，解压后，发现其实就是`package.json`中build下files中的文件内容。
- 优化视图层(react)。思路：在打安装包之前，已经通过`npm run build`将react相关的代码，也就是视图层的代码，进行了打包到`build`文件夹下，因此其实只需要将main.js中用到的包放在`dependencies`中就行了，剩余的包，移动到`devDependencies`中。因为electron-builder不会把devDependencies中的包打包进应用程序
- 优化electron层。思路：通过新建webpack.config.js将main.js进行打包，并配置，将main.js打包进入build文件夹

## 如何release

- 在`package.json`中配置`release`的平台为`github`，即在`build`中配置如何代码
```json
    "publish": ["github"]
```
- 在`GitHub`中生成该项目所需要的`access_key`，并替换如下代码`you_access_key`的对应位置
- 在`package.json`中配置`release`命令并设置环境变量，如下：
```javascript
"release": "cross-env GH_TOKEN=you_access_key electron-builder",
    "prerelease": "npm run build && npm run buildMain"
```
- `npm run release`即可。
