const Qiniu = require("qiniu");
const Base = require('../base');

class QiniuCloud {
  constructor(options) {
    let config = new Qiniu.conf.Config();
    let mac = new Qiniu.auth.digest.Mac(options.accessKey, options.secretKey);
    config.zone = Qiniu.zone[options.zone];
    
    this.qiniu = {
      formUploader: new Qiniu.form_up.FormUploader(config),
      mac,
      bucketManager: new Qiniu.rs.BucketManager(mac, config)
    };
    this.options = options;
  }

  async exist(path, CDNPath){
    try {
      let files = (await this.qiniuListPrefix(CDNPath)).items;
      files = files.filter(item => item.key === CDNPath);
      if(files.length > 0){
        return true;
      }
    } catch(err) {
      return false;
    }
  }

  async upload(path, CDNPath){
    try {
      let options = {
          scope: `${this.options.bucket}:${CDNPath}`,
        },
        putPolicy = new Qiniu.rs.PutPolicy(options);
      let result = await this.qiniuPutFile(
        putPolicy.uploadToken(this.qiniu.mac),
        CDNPath,
        path
      );
      if(/png$/.test(CDNPath)) console.log(result);
      return result.statusCode === 200;
    } catch(err){
      throw err;
    }
  }

  qiniuPutFile(token, path, localFile){
    return new Promise(((resolve, reject) => {
      this.qiniu.formUploader.putFile(
        token,
        path,
        localFile,
        new Qiniu.form_up.PutExtra(),
        (err, respBody, respInfo) => {
          if(err){
            reject(err);
          }else{
            resolve(respInfo);
          }
        })
    }))
  }

  qiniuListPrefix(prefix){
    return new Promise(((resolve, reject) => {
      this.qiniu.bucketManager.listPrefix(
        this.options.bucket,
        {prefix},
        (err, respBody, respInfo) => {
          if(err){
            reject(err);
          }
          if(respInfo.statusCode == 200){
            resolve(respBody);
          }
        })
    }))
  }

  async getFilesByFolder(prefix){
    try {
      let files = (await this.qiniuListPrefix(prefix)).items;
      files = files.map(item => {
        item.name = item.key;
        return item;
      });
      return files;
    } catch(err) {
      throw err;
    }
  }

  async deleteFile(path){
    let result = await new Promise(((resolve, reject) => {
      this.qiniu.bucketManager.delete(
        this.options.bucket,
        path,
        (err, respBody, respInfo) => {
          if(err){
            throw err;
            reject(err);
          }
          resolve(respInfo);
        })
    }));
    return result.statusCode >= 200 && result.statusCode < 300;
  }
}

module.exports = QiniuCloud;
