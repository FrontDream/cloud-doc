import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FileSearch, FileList } from './components'
import defaultFiles from './utils/defaultFiles'

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
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
        </div>
          <div className="col-9 right-panel">
          </div>
      </div>
    </div>
  );
}

export default App;
