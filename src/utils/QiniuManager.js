const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs')

class QiniuManager{
    constructor(accessKey, secretKey, bucket) {
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket;
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;
        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }
    // 上传
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
    // 获取域名
    getBucketDomain(){
        const reqUrl = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac, reqUrl)
        return new Promise((resolve, reject)=>{
            qiniu.rpc.postWithoutForm(reqUrl, digest, this._handleCallBack(resolve, reject))
        })
    }
    // 获取下载链接
    generateDownLink(key){
        // 避免重复发请求获取domain
        const domainPromise = this.publicBucketDomain? Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then((data)=>{
            if(Array.isArray(data) && data.length>0){
                const reg = /^https?/
                // 如果已经有了http就不加了
                this.publicBucketDomain = reg.test(data[0]) ? data[0]: `http://${data[0]}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key);
            }else {
                throw Error('域名未找到，请查看域名是否过期')
            }
        })
    }
    // 删除文件
    deleteFile(key){
        return new Promise((resolve, reject)=>{
            this.bucketManager.delete(this.bucket, key, this._handleCallBack(resolve,reject));
        })
    }
    // 获取文件信息
    getStat(key){
        return new Promise((resolve, reject)=>{
            this.bucketManager.stat(this.bucket, key, this._handleCallBack(resolve, reject));
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
    downloadFile(key, downPath){
        return this.generateDownLink(key).then(link=>{
            const timeStamp = new Date().getTime()
            const url = `${link}?r=${timeStamp}`
            return axios({
                url,
                method: 'GET',
                responseType:"stream",
                headers: { 'Cache-Control': 'no-cache'}
            }).then(response=>{
                const writer = fs.createWriteStream(downPath)
                response.data.pipe(writer)
                return new Promise((resolve, reject)=>{
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })
            }).catch(err=>{
                return Promise.reject({
                    err: err.response
                })
            })
        })
    }
}

module.exports = QiniuManager