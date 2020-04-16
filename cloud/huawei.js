const ObsClient = require('esdk-obs-nodejs');
const Base = require('../base');

class Huawei {
  constructor(options) {
    this.huawei = new ObsClient({
      access_key_id: options.accessKeyId,
      secret_access_key: options.secretAccessKey,
      server : options.server
    });
    this.options = options;
  }

  async exist(path, CDNPath){
    try {
      let data = await this.promise("getObjectMetadata", {
        Key: CDNPath,
      });
      if(data.InterfaceResult){
        return true;
      }
      return false;
    } catch(err) {
      return false;
    }
  }

  async upload(path, CDNPath){
    try {
      let result = await this.promise("putObject", {
        Key: CDNPath,
        SourceFile: path
      });
      return result.CommonMsg.Status === 200;
    } catch(err){
      throw err;
    }
  }

  promise(method, params={}){
    return new Promise(((resolve, reject) => {
      params.Bucket = this.options.bucket;
      this.huawei[method](params, (err, result) => {
        if(err){
          reject(err);
        }else{
          resolve(result);
        }
      })
    }))
  }

  async getFilesByFolder(prefix){
    try {
      let files = (await this.promise("listObjects", {
        Prefix : prefix
      })).InterfaceResult.Contents;
      files = files.map(item => {
        item.name = item.Key;
        return item;
      });
      return files;
    } catch(err){
      throw err;
    }
  }

  async deleteFile(path){
    try {
      let result = await this.promise("deleteObject", {
        Key: path
      });
      return result.CommonMsg.Status >= 200 && result.CommonMsg.Status < 300;
    } catch(err){
      throw err;
    }
  }
}

module.exports = Huawei;
