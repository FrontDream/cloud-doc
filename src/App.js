import React, { useState, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import { faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';
import { FileSearch, FileList, BottomBtn , TabList } from './components'
import defaultFiles from './utils/defaultFiles'
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';
import { flattenArr, objToArr } from './utils/helper'
import './App.css';


function App() {
    const [files, setFiles] = useState(flattenArr(defaultFiles))
    const [activeFileID, setActiveFileID] = useState('')
    const [openedFileIDs, setOpenedFileIDs] = useState([])
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    const [searchedFiles, setSearchedFiles] = useState([])

    const openedFiles = openedFileIDs.map(id=>files[id])
    const activeFile = files[activeFileID]
    const filesArr = objToArr(files)
    const fileListArr = searchedFiles.length>0?searchedFiles: filesArr

    const fileClick = (id)=>{
        setActiveFileID(id)
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
        const newFile = {...files[id], body: value}
        setFiles({...files,[id]:newFile})
        if(!unsavedFileIDs.includes(id)){
            setUnsavedFileIDs([...unsavedFileIDs,id])
        }
    }
    const deleteFile = (id)=>{
        delete files[id]
        setFiles(files)
        tabClose(id)
    }
    const updateFileName = (id,title)=>{
        const modifyFile = {...files[id], title,isNew:false}
        setFiles({...files, [id]:modifyFile})
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
