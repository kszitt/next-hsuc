const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');

class Tencent {
  constructor(options) {
    this.tencent = new COS({
      SecretId: options.secretId,
      SecretKey: options.secretKey
    })

    this.options = options;
  }

  promise(method, params){
    return new Promise(((resolve, reject) => {
      this.tencent[method]({
        Bucket: this.options.bucket,
        Region: this.options.region,
        ...params
      }, function(err, data) {
        if(err) reject(err);
        resolve(data);
      });
    }))
  }

  async exist(path, CDNPath){
    try {
      let data = await this.promise("getObject", {Key: CDNPath});
      return true;
    } catch(err) {
      return false;
    }
  }

  async upload(path, CDNPath){
    try {
      let params = {
        Key: CDNPath,
        Body: fs.createReadStream(path)
      };
      return await this.promise("putObject", params);
    } catch(err){
      throw err;
    }
  }

  async getFilesByFolder(prefix){
    try {
      let data = await this.promise("getBucket", {Prefix: prefix});
      data.Contents.forEach(item => {
        item.name = item.Key;
      })
      return data.Contents;
    } catch(err){
      throw err;
    }
  }

  async deleteFile(path){
    try {
      let data = await this.promise("deleteObject", {Key: path});
      return data.statusCode && data.statusCode >= 200 && data.statusCode < 300;
    } catch(err){
      throw err;
    }
  }
}

module.exports = Tencent;
