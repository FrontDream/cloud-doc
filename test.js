const QiniuManager = require('./src/utils/QiniuManager')



const ak = '4nYOFOOMTl-uksX8GqsEvEMutkG1LJBOzGRlmFe4';
const sk = 'tJ44D-EDE9rCY6gIz8sUL9glScBfPuWVi1G8DtDP';

const loadFile = '/Users/qiandingwei/Desktop/name5.md';

const key = 'name5.md';

const qiniu = new QiniuManager(ak,sk,'cloudfrontdream')

// qiniu.uploadFile(key, loadFile);

qiniu.deleteFile(key)

// const publicDomain = 'http://qnswuj6b4.hd-bkt.clouddn.com';