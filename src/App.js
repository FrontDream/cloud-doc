import React, { useState, useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import { faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';
import { FileSearch, FileList, BottomBtn , TabList } from './components'
import defaultFiles from './utils/defaultFiles'
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css";
import './App.css';


function App() {
    const [files, setFiles] = useState(defaultFiles)
    const [activeFileID, setActiveFileID] = useState('')
    const [openedFileIDs, setOpenedFileIDs] = useState([])
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([])
    const openedFiles = files.filter(file=>openedFileIDs.includes(file.id))
    const activeFile = files.find(file=>file.id === activeFileID)

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
        const newFiles = files.map(file=>{
            if(file.id===id){
                file.body = value
            }
            return file
        })
        setFiles(newFiles)
        if(!unsavedFileIDs.includes(id)){
            setUnsavedFileIDs([...unsavedFileIDs,id])
        }
    }
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 left-panel">
            <FileSearch
                title={'我的云文档'}
                onFileSearch={(value)=>{ console.log(value)}}
            />
            <FileList
                files={files}
                onFileClick={fileClick}
                onFileDelete={(id)=>console.log('del:', id)}
                onSaveEdit={(id,value)=>{
                    console.log('id:', id)
                    console.log('newValue:', value)
                }}
            />
            <div className='row no-gutters button-group'>
                <div className={'col'}>
                    <BottomBtn
                        text={'新建'}
                        colorClass="btn-primary"
                        icon={faPlus}
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
