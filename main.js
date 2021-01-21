const { app ,BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')

let mainWindow;

app.on('ready',()=>{
    // require('devtron').install();
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    const urlLocation = isDev?'http://localhost:3000': 'ddd'
    mainWindow.loadURL(urlLocation)
    mainWindow.webContents.openDevTools({ mode: 'bottom'})
})