const qiniu = require('qiniu')

class QiniuManager{
    constructor(accessKey, secretKey, bucket) {
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket;

        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;

        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }
    uploadFile(key,loadFilePath){
        const options = {
            scope: this.bucket + ':' + key,
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken=putPolicy.uploadToken(this.mac);

        const formUploader = new qiniu.form_up.FormUploader(this.config);
        const putExtra = new qiniu.form_up.PutExtra();

        return new Promise((resolve,reject)=>{
            formUploader.put(uploadToken, key, loadFilePath, putExtra, this._handleCallBack(resolve,reject))
        })
    }
    getBucketDomain(){
        const reqUrl = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqUrl)
        return new Promise((resolve, reject)=>{
            qiniu.rpc.postWithoutForm(reqUrl, digest, this._handleCallBack(resolve, reject))
        })
    }
    deleteFile(key){
        return new Promise((resolve, reject)=>{
            this.bucketManager.delete(this.bucket, key, this._handleCallBack(resolve,reject));
        })
    }
    _handleCallBack(resolve,reject){
        return (respErr, respBody, respInfo)=> {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody)
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody
                })
            }
        }
    }
}

module.exports = QiniuManager