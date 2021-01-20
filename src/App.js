import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faPlus, faFileImport} from '@fortawesome/free-solid-svg-icons';
import { FileSearch, FileList, BottomBtn } from './components'
import defaultFiles from './utils/defaultFiles'

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
          </div>
      </div>
    </div>
  );
}

export default App;
