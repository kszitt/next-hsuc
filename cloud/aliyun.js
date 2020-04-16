const Aliyun = require('ali-oss');
const Base = require('../base');

class AliyunCloud {
  constructor(options) {
    let aliyun = new Aliyun({
      region: options.region,
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
    });
    aliyun.useBucket(options.bucket);
    
    this.aliyun = aliyun;
    this.options = options;
  }

  async exist(path, CDNPath){
    try {
      let data = await this.aliyun.get(CDNPath);
      if(data.res.status === 200){
        return true;
      }
    } catch(err) {
      return false;
    }
  }

  async upload(path, CDNPath){
    try {
      return await this.aliyun.put(CDNPath, path);
    } catch(err){
      throw err;
    }
  }

  async getFilesByFolder(prefix){
    try {
      return (await this.aliyun.list({prefix})).objects;
    } catch(err){
      throw err;
    }
  }

  async deleteFile(path){
    try {
      let result = await this.aliyun.delete(path);
      return result.res && result.res.status >= 200 && result.res.status < 300;
    } catch(err){
      throw err;
    }
  }
}

module.exports = AliyunCloud;
