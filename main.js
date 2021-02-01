const { app ,BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const menuTemplate = require('./src/menuTemplate')

const AppWindow = require('./src/AppWindow')

let mainWindow, settingWindow;

app.on('ready',()=>{
    // require('devtron').install();
    // mainWindow = new BrowserWindow({
    //     width: 1024,
    //     height: 680,
    //     webPreferences: {
    //         nodeIntegration: true,
    //         enableRemoteModule: true
    //     }
    // })
    const mainWinConfig = {
        width: 1024,
        height: 680,
    }
    const urlLocation = isDev?'http://localhost:3000': 'ddd'
    mainWindow = new AppWindow(mainWinConfig, urlLocation)
    mainWindow.on('close',()=>{
        mainWindow = null
    })
    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    ipcMain.on('open-settings-window',()=>{
        const settingConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingWindow = new AppWindow(settingConfig, settingLocation)
        settingWindow.removeMenu()
        settingWindow.on('closed', () => {
            settingWindow = null
        })
    })
    ipcMain.on('config-is-saved',()=>{
        let qiniuMenu = process.platform==='darwin'? menu.items[3]: menu.items[2]
        const switchEnable = (toggle)=>{
            [1,2,3].forEach(num=>{
                qiniuMenu.submenu.items[num].enabled = toggle
            })
        }
        const qiniuConfigArr = ['accessKey', 'secretKey', 'bucketName']
        const isConfig = qiniuConfigArr.every(item=>!!settingsStore.get(item))
        if(isConfig){
            switchEnable(true)
        }else {
            switchEnable(false)
        }
    })
    // mainWindow.loadURL(urlLocation)
    mainWindow.webContents.openDevTools({ mode: 'bottom'})


})