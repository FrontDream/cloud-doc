const fs = window.require('fs').promises

const fileHelper = {
    // 读取
    readFile: (path)=>{
        return fs.readFile(path,{
            encoding: 'utf-8'
        })
    },
    // 写文件
    writeFile: (path, content)=>{
        return fs.writeFile(path, content,{encoding: 'utf-8'})
    },
    // 重明命名文件
    renameFile: (path, newPath)=>{
        return fs.rename(path,newPath)
    },
    // 删除文件
    deleteFile: (path)=>{
        return fs.unlink(path)
    }
}

export default fileHelper