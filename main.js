const { app, Menu, ipcMain, dialog } = require('electron')
const { autoUpdater} = require('electron-updater')
const path = require('path')
const isDev = require('electron-is-dev')
const Store = require('electron-store')
const menuTemplate = require('./src/menuTemplate')
const QiniuManager = require('./src/utils/QiniuManager')
const AppWindow = require('./src/AppWindow')
const settingsStore = new Store({name: 'Settings'})
const fileStore = new Store({ name: 'cloudDoc' })

let mainWindow, settingWindow;

const createManager = ()=>{
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new QiniuManager(accessKey, secretKey, bucketName)
}

app.on('ready',()=>{
    // 自动更新
    autoUpdater.autoDownload = false
    // 检查是否有可更新的可用
    autoUpdater.checkForUpdatesAndNotify()
    // 检测错误
    autoUpdater.on('error',(error)=>{
        dialog.showErrorBox('Error',error===null?"un-known":error)
    })
    // 当有可更新的可用
    autoUpdater.on('update-available',()=>{
        dialog.showMessageBox({
            type: 'info',
            title: '应用有新的版本',
            message: '发现新应用，是否现在更新?',
            buttons: ['是','否'],
        },(buttonIndex)=>{
            if(buttonIndex===0){
                autoUpdater.downloadUpdate()
            }
        })
    })
    // 无新的版本可用
    autoUpdater.on('update-not-available',()=>{
        dialog.showMessageBox({
            type: 'info',
            title: '没有新的版本',
            message: '当前已经是最新版本',
        })
    })
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
    // 打开设置窗口
    ipcMain.on('open-settings-window',()=>{
        const settingConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingWindow = new AppWindow(settingConfig, settingLocation)
        // 设置中心弹框不需要菜单
        settingWindow.removeMenu()
        settingWindow.on('closed', () => {
            settingWindow = null
        })
    })
    // 按下ctrl+s，app.js监听到后，告诉main.js上传文件到七牛云，上传成功后，告诉app.js更新文件列表
    ipcMain.on('upload-file',(event,data)=>{
        const qiniu = createManager();
        qiniu.uploadFile(data.key, data.path).then(res=>{
            console.log('同步成功:', res)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(err=>{
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
    })
    // 全部同步至云端
    ipcMain.on('upload-all-to-qiniu',()=>{
        // 通知app.js渲染loading
        mainWindow.webContents.send('loading-status', true)
        const manager = createManager();
        // 从本地读取文件
        const files = fileStore.get('files')
        // 生成上传的promise
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
    // 点击某一行，告诉main进程去下载，下载成功后通知app.js去重新读取文件，重新渲染
    ipcMain.on('down-file',(event, data)=>{
        const { id, key, path } =data
        const manager = createManager();
        const files = fileStore.get('files')
        // 先比对，看看更新时间，如果远端的更新，则下载
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
        },(err)=>{
            if (err.statusCode === 612) {
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
            }
        })
    })
    // 设置中心弹框点击确定后，通知main进程去检查accessKey、secretKey、bucketName是否都有值，当都有值时，自动同步、全部同步至云端、从云端下载至本地等菜单才可用，否则不可用
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