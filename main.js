const { app ,BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const menuTemplate = require('./src/menuTemplate')
const QiniuManager = require('./src/utils/QiniuManager')

const AppWindow = require('./src/AppWindow')

const fileStore = new Store({
    name: 'cloudDoc'
})


let mainWindow, settingWindow;

const createManager = ()=>{
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey, secretKey, bucketName)
}

app.on('ready',()=>{
    const mainWinConfig = {
        width: 1024,
        height: 680,
    }
    const urlLocation = isDev?'http://localhost:3000': `file://${path.join(__dirname, './index.html')}`
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
    ipcMain.on('upload-file',(event,data)=>{
        const qiniu = createManager();
        qiniu.uploadFile(data.key, data.path).then(res=>{
            console.log('同步成功:', res)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(err=>{
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })

    })
    ipcMain.on('upload-all-to-qiniu',()=>{
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager();
        const files = fileStore.get('files')
        const filesPromiseArr = Object.keys(files).map(key=>{
            const file = files[key]
            return manager.uploadFile(`${file.title}.md`, file.path)
        })
        Promise.all(filesPromiseArr)
            .then(result=>{
                console.log(result)
                // show uploaded message
                dialog.showMessageBox({
                    type: 'info',
                    title: `成功上传了${result.length}个文件`,
                    message: `成功上传了${result.length}个文件`,
                })
                mainWindow.webContents.send('files-uploaded')
            })
            .catch(() => {
                dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
            })
            .finally(() => {
                mainWindow.webContents.send('loading-status', false)
        })
    })
    ipcMain.on('down-file',(event, data)=>{
        const { id, key, path } =data
        const manager = createManager();
        const files = fileStore.get('files')
        manager.getStat(key).then(res=>{
            const serverUpdate =Math.round(res.putTime / 10000);
            const localUpdate = files[id].updatedAt
            if(serverUpdate>localUpdate || !localUpdate){
                manager.downloadFile(key,path).then(()=>{
                    mainWindow.webContents.send('file-downloaded',{ status: 'downloaded-success', id })
                })
            }else{
                mainWindow.webContents.send('file-downloaded',{ status: 'no-new-file', id })
            }
            // console.log('data=========>', data)
        },(err)=>{
            if (err.statusCode === 612) {
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
            }
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
})