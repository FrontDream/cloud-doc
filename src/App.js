import React, { useState, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import { faPlus, faFileImport, faSave} from '@fortawesome/free-solid-svg-icons';
import { FileSearch, FileList, BottomBtn , TabList } from './components'
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';
import { flattenArr, objToArr } from './utils/helper';
import fileHelper from './utils/fileHelper';
import { useIpcRenderer } from './hooks'
import './App.css';

const { join, basename, extname, dirname } = window.require('path')
// remote 可以用于取mainProcess中的相关方法
const { remote, ipcRenderer }= window.require('electron')
const Store = window.require('electron-store');

// const remote = electron.remote
const settingsStore = new Store({name: 'Settings'})

const qiniuConfigArr = ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync']

const getAuthConfig = () => qiniuConfigArr.every(item=>!!settingsStore.get(item))

const fileStore = new Store({
    name: 'cloudDoc'
})

const saveFilesToStore = (files)=>{
    const fileObjectStore = objToArr(files).reduce((result,file)=>{
        const { id, path, title, createdAt } = file
        result[id] = {
            id,
            path,
            title,
            createdAt,
        }
        return result
    },{})
    fileStore.set('files', fileObjectStore)
}

function App() {
    const [files, setFiles] = useState(fileStore.get('files') || {})
    const [activeFileID, setActiveFileID] = useState('')
    const [openedFileIDs, setOpenedFileIDs] = useState([])
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    const [searchedFiles, setSearchedFiles] = useState([])

    const openedFiles = openedFileIDs.map(id=>files[id])
    const activeFile = files[activeFileID]
    const filesArr = objToArr(files)
    const fileListArr = searchedFiles.length>0?searchedFiles: filesArr
    const savedLocation =settingsStore.get('savedFileLocation') || remote.app.getPath('documents')

    const fileClick = (id)=>{
        const currentFile = files[id]
        setActiveFileID(id)
        if(!currentFile.isLoaded){
            fileHelper.readFile(currentFile.path).then(value=>{
                const newFile = { ...currentFile, body: value, isLoaded: true}
                setFiles({ ...files, [id]: newFile})
            })
        }
        if(!openedFileIDs.includes(id)){
            setOpenedFileIDs([...openedFileIDs,id])
        }
    }
    const tabClick = (fileId)=>{
        setActiveFileID(fileId)
    }
    const tabClose = (fileId)=>{
        const tabRes = openedFileIDs.filter(id=>id!==fileId)
        setOpenedFileIDs(tabRes)
        if(tabRes.length>0){
            setActiveFileID(tabRes[0])
            return
        }
        setActiveFileID('')
    }
    const fileChange = (id, value)=>{
        if(value!==files[id].body){
            const newFile = {...files[id], body: value}
            setFiles({...files,[id]:newFile})
            if(!unsavedFileIDs.includes(id)){
                setUnsavedFileIDs([...unsavedFileIDs,id])
            }
        }
    }
    const deleteFile = (id)=>{
        if(files[id].isNew){
            const { [id]: value, ...afterDelete }= files
            setFiles(afterDelete)
        }else {
            fileHelper.deleteFile(files[id].path).then(()=>{
                const { [id]: value, ...afterDelete }= files
                setFiles(afterDelete)
                saveFilesToStore(afterDelete)
                tabClose(id)
            })
        }
    }
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
    const fileSearch = (keyword)=>{
        const newFiles = filesArr.filter(file=>file.title.includes(keyword))
        setSearchedFiles(newFiles)
    }
    const createNewFiles = ()=>{
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
    const importFiles = () =>{
        remote.dialog.showOpenDialog({
            title: '请选择 MarkDown 文件',
            properties: ['openFile','multiSelections'],
            filters: [{ name: 'MarkDown', extensions: ['md'] }]
        }).then(result=>{
            if(Array.isArray(result.filePaths)){
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
    useIpcRenderer({
        'create-new-file': createNewFiles,
        'save-edit-file': saveCurrentFile,
        'import-file': importFiles
    })
  return (
    <div className="App container-fluid px-0">
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
                              unsaveIds={unsavedFileIDs}
                          />

                          <SimpleMDE
                              key={activeFile&&activeFile.id}
                              value={activeFile&&activeFile.body}
                              onChange={(value)=>{ fileChange(activeFile.id, value)}}
                              options={{
                                  minHeight: '515px'
                              }}
                          />
                      </>
                  )
              }
          </div>
      </div>
    </div>
  );
}

export default App;
