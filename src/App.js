import React, { useState,useCallback, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import { v4 as uuidv4 } from 'uuid';
import { faPlus, faFileImport, faSave} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css";
import { FileSearch, FileList, BottomBtn , TabList, Loader } from './components';
import { flattenArr, objToArr, timestampToString } from './utils/helper';
import fileHelper from './utils/fileHelper';
import { useIpcRenderer } from './hooks';
import './App.css';

// 分别表示路径拼接，获得路径中的最后一段,路径当中最后一段文件的扩展名,获得路径当中最后一段文件或文件夹所在的路径。
const { join, basename, extname, dirname } = window.require('path')
// remote 可以用于取mainProcess中的相关方法
const { remote, ipcRenderer }= window.require('electron')
const Store = window.require('electron-store');
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync']
const getAuthConfig = () => qiniuConfigArr.every(item=>!!settingsStore.get(item))
const fileStore = new Store({name: 'cloudDoc'})

const saveFilesToStore = (files)=>{
    const fileObjectStore = objToArr(files).reduce((result,file)=>{
        const { id, path, title, createdAt, isSynced, updatedAt } = file
        result[id] = {
            id,
            path,
            title,
            createdAt,
            isSynced,
            updatedAt
        }
        return result
    },{})
    fileStore.set('files', fileObjectStore)
}

function App() {
    // 文件列表
    const [files, setFiles] = useState(fileStore.get('files') || {})
    // 当前打开的正在编辑的markdown文件的ID
    const [activeFileID, setActiveFileID] = useState('')
    // 当前打开的文件
    const [openedFileIDs, setOpenedFileIDs] = useState([])
    // 打开修改后未保存的文件
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    // 搜索后的文件
    const [searchedFiles, setSearchedFiles] = useState([])
    const [ isLoading, setLoading ] = useState(false)
    const openedFiles = openedFileIDs.map(id=>files[id])
    const activeFile = files[activeFileID]
    const filesArr = objToArr(files)
    const fileListArr = searchedFiles.length>0?searchedFiles: filesArr
    // 用户设置的路径 || 软件的根目录
    const savedLocation =settingsStore.get('savedFileLocation') || remote.app.getPath('documents')

    // 点击某一行，打开对应的文档
    const fileClick = (id)=>{
        // 当前点击的文件
        const currentFile = files[id]
        // 右侧打开的文件ID
        setActiveFileID(id)
        // 是否已经加载到内存,标题，路径
        const { isLoaded, title, path } = currentFile
        // 尚未加载到内存
        if(!isLoaded){
            // 设置了'accessKey', 'secretKey', 'bucketName', 并开启了自动同步，则向七牛云发起请求下载文件
            if(getAuthConfig()){
                ipcRenderer.send('down-file', { key: `${title}.md`, id, path })
            }else {
                // 否则读取本地文件
                fileHelper.readFile(path).then(value=>{
                    const newFile = { ...currentFile, body: value, isLoaded: true}
                    setFiles({ ...files, [id]: newFile})
                })
            }
        }
        // 没有打开则添加到打开列表
        if(!openedFileIDs.includes(id)){
            setOpenedFileIDs([...openedFileIDs,id])
        }
    }
    // 点击某个tab
    const tabClick = (fileId)=>{
        setActiveFileID(fileId)
    }
    // 关闭tab
    const tabClose = (fileId)=>{
        const tabRes = openedFileIDs.filter(id=>id!==fileId)
        setOpenedFileIDs(tabRes)
        if(tabRes.length>0){
            setActiveFileID(tabRes[0])
            return
        }
        setActiveFileID('')
    }
    // Markdown文件修改
    const fileChange = (id, value)=>{
        if(value!==files[id].body){
            const newFile = {...files[id], body: value}
            setFiles({...files,[id]:newFile})
            if(!unsavedFileIDs.includes(id)){
                setUnsavedFileIDs([...unsavedFileIDs,id])
            }
        }
    }
    //删除文件
    const deleteFile = (id)=>{
        // 刚新建，就点击esc取消键
        if(files[id].isNew){
            const { [id]: value, ...afterDelete }= files
            setFiles(afterDelete)
        }else {
            // 根据路径删除本地文件
            fileHelper.deleteFile(files[id].path).then(()=>{
                const { [id]: value, ...afterDelete }= files
                setFiles(afterDelete)
                saveFilesToStore(afterDelete)
                tabClose(id)
            })
        }
    }
    // 更新文件标题
    const updateFileName = (id,title, isNew)=>{
        const newPath =isNew? join(savedLocation,`${title}.md`): join(dirname(files[id].path), `${title}.md`)
        const modifyFile = {...files[id], title,isNew:false, path: newPath}
        const newFiles = {...files, [id]:modifyFile}
        if(isNew){
            // 新建的时候存储到本地
            fileHelper.writeFile(newPath,files[id].body).then(()=>{
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        }else {
            const oldPath = files[id].path
            fileHelper.renameFile(oldPath,newPath).then(()=>{
                setFiles(newFiles)
                saveFilesToStore(newFiles)
            })
        }
    }
    // 搜索
    const fileSearch = (keyword)=>{
        const newFiles = filesArr.filter(file=>file.title.includes(keyword))
        setSearchedFiles(newFiles)
    }
    // 新建
    const createNewFiles =()=>{
        const newId = uuidv4()
        const newFile = {
            id: newId,
            title: '',
            body: '## 请输入MarkDown',
            createdAt: new Date().getTime(),
            isNew: true
        }
        setFiles({...files,[newId]:newFile})
    }
    const saveCurrentFile = ()=>{
        const {path, body, id, title} = activeFile
        fileHelper.writeFile(path,body).then(()=>{
            setUnsavedFileIDs(unsavedFileIDs.filter(fileId=>fileId!==id))
            if(getAuthConfig()){
                ipcRenderer.send('upload-file', { key: `${title}.md`, path })
            }
        })
    }
    // 导入
    const importFiles = () =>{
        remote.dialog.showOpenDialog({
            title: '请选择 MarkDown 文件',
            properties: ['openFile','multiSelections'],
            filters: [{ name: 'MarkDown', extensions: ['md'] }]
        }).then(result=>{
            if(Array.isArray(result.filePaths)){
                // 根据路径过滤出已经存在的文件
                const filterPath = result.filePaths.filter(path=>{
                    const alreadyExist = Object.values(files).find(item=>item.path === path)
                    return !alreadyExist
                })
                const importedFiles = filterPath.map(path=>{
                    return {
                        id: uuidv4(),
                        title: basename(path, extname(path)),
                        path
                    }
                })
                const newFiles = {...files, ...flattenArr(importedFiles)}
                setFiles(newFiles)
                saveFilesToStore(newFiles)
                if(newFiles.length>0){
                    remote.dialog.showMessageBox({
                        type: "info",
                        message: `您成功的导入了${newFiles.length}个文件`
                    })
                }
            }
        })
    }
    const updateCurrentFile=()=>{
        const { id } = activeFile
        const modifyFile = {...files[id], isSynced: true, updatedAt: new Date().getTime()}
        const updateFile = { ...files, [id]: modifyFile}
        setFiles(updateFile)
        saveFilesToStore(updateFile)
    }
    const fileServerUpdate = (event, message)=>{
        const currentFile = files[message.id]
        const { id ,path } = currentFile
        fileHelper.readFile(path).then(value=>{
            let newFile
            if(message.status==='downloaded-success'){
                newFile = { ...files[id], body: value, isLoaded: true, isSynced: true, updatedAt: new Date().getTime() }
            }else{
                newFile = { ...files[id], body: value, isLoaded: true }
            }
            const newFiles = {...files, [id]: newFile}
            setFiles(newFiles)
            saveFilesToStore(newFiles)
        })

    }
    const filesUploaded=()=>{
        const newFiles = objToArr(files).reduce((result, file) => {
            const currentTime = new Date().getTime()
            result[file.id] = {
                ...files[file.id],
                isSynced: true,
                updatedAt: currentTime,
            }
            return result
        }, {})
        setFiles(newFiles)
        saveFilesToStore(newFiles)
    }
    useIpcRenderer({
        'create-new-file': createNewFiles,
        'save-edit-file': saveCurrentFile,
        'import-file': importFiles,
        'active-file-uploaded': updateCurrentFile,
        'file-downloaded': fileServerUpdate,
        'files-uploaded': filesUploaded,
        'loading-status': (message, status) => { setLoading(status) }
    })
  return (
    <div className="App container-fluid px-0">
        { isLoading &&
            <Loader />
        }
      <div className="row no-gutters">
        <div className="col-3 left-panel">
            <FileSearch
                title={'我的云文档'}
                onFileSearch={fileSearch}
            />
            <FileList
                files={fileListArr}
                onFileClick={fileClick}
                onFileDelete={deleteFile}
                onSaveEdit={updateFileName}
            />
            <div className='row no-gutters button-group'>
                <div className={'col'}>
                    <BottomBtn
                        text={'新建'}
                        colorClass="btn-primary"
                        icon={faPlus}
                        onBtnClick={createNewFiles}
                    />
                </div>
                <div className={'col'}>
                    <BottomBtn
                        text={'导入'}
                        colorClass="btn-success"
                        icon={faFileImport}
                        onBtnClick={importFiles}
                    />
                </div>
            </div>
        </div>
          <div className="col-9 right-panel">
              {
                  !activeFile && (
                      <div className="start-page">
                          选择或者创建新的MarkDown文档
                      </div>
                  )
              }
              {
                  activeFile && (
                      <>
                          <TabList
                              files={openedFiles}
                              onTabClick={tabClick}
                              onCloseTab={tabClose}
                              activeId={activeFileID}
                             unSaveIds={unsavedFileIDs}
                          />

                          <SimpleMDE
                              key={activeFile&&activeFile.id}
                              value={activeFile&&activeFile.body}
                              onChange={(value)=>{ fileChange(activeFile.id, value)}}
                              options={{
                                  minHeight: '515px'
                              }}
                          />
                          { activeFile.isSynced &&
                                <span className="sync-status">已同步，上次同步{timestampToString(activeFile.updatedAt)}</span>
                          }
                      </>
                  )
              }
          </div>
      </div>
    </div>
  );
}

export default App;
