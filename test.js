const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')



const ak = '4nYOFOOMTl-uksX8GqsEvEMutkG1LJBOzGRlmFe4';
const sk = 'tJ44D-EDE9rCY6gIz8sUL9glScBfPuWVi1G8DtDP';

const loadFile = '/Users/qiandingwei/Desktop/新的一天.md';

const key = 'name5.md';

const qiniu = new QiniuManager(ak,sk,'cloudfrontdream')
const downPath = path.join(__dirname, key)
const upPath = path.join(__dirname, key)
//
// qiniu.downloadFile(key, downPath).then(()=>{
//     console.log('下载写入完毕')
// }, (err)=>console.log(err))

// qiniu.getDomain().then(data=>{
//     console.log(data)
// })

// qiniu.generateDownLink(key).then(data=>{
//     console.log(data)
//     return qiniu.generateDownLink('name6')
// }).then(data=>{
//     console.log(data)
// })

qiniu.uploadFile(key, upPath).then(data=>{
    console.log('上传成功：', data)
});

// qiniu.deleteFile(key)

// const publicDomain = 'http://qnswuj6b4.hd-bkt.clouddn.com';