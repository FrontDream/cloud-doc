import React from "react";
import SimpleMDE from "react-simplemde-editor";
import { faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';
import { FileSearch, FileList, BottomBtn , TabList } from './components'
import defaultFiles from './utils/defaultFiles'
import 'bootstrap/dist/css/bootstrap.min.css';
import "easymde/dist/easymde.min.css";
import './App.css';


function App() {
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 left-panel">
            <FileSearch
                title={'我的云文档'}
                onFileSearch={(value)=>{ console.log(value)}}
            />
            <FileList
                files={defaultFiles}
                onFileClick={(id)=>console.log(id)}
                onFileDelete={(id)=>console.log('del:', id)}
                onSaveEdit={(id,value)=>{
                    console.log('id:', id)
                    console.log('newValue:', value)
                }}
            />
            <div className='row no-gutters'>
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
              <TabList
                  files={defaultFiles}
                  onTabClick={(id)=>console.log(id)}
                  onCloseTab={id=>console.log('close:', id)}
                  activeId={'1'}
                  unsaveIds={["1","2"]}
              />
              <SimpleMDE
                value={defaultFiles[1].body}
                onChange={(value)=>{ console.log(value)}}
                options={{
                    minHeight: '515px'
                }}
              />
          </div>
      </div>
    </div>
  );
}

export default App;
