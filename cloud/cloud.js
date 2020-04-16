



class Cloud {
  constructor(options){
    try {
      for(let key in options){
        switch(key){
          case "custom":
            const Custom = options[key];
            this.CDN = new Custom(options);
            break;
          case "huawei":
            const Huawei = require("../cloud/huawei");
            this.CDN = new Huawei(options[key]);
            break;
          case "aliyun":
            const Aliyun = require("../cloud/aliyun");
            this.CDN = new Aliyun(options[key]);
            break;
          case "qiniu":
            const Qiniu = require("../cloud/qiniu");
            this.CDN = new Qiniu(options[key]);
            break;
          case "upyun":
            const Upyun = require("../cloud/upyun");
            this.CDN = new Upyun(options[key]);
            break;
        }
        if(this.CDN) break;
      }
    } catch (err) {
      throw err;
    }
  }

  // 上传文件
  async uploadFile(path, CDNPath, cover){
    if((typeof cover === "boolean" ? cover : cover.test(CDNPath)) && await this.CDN.exist(path, CDNPath)) {
      return "exist";
    }
    return await this.CDN.upload(path, CDNPath);
  }

  // 获取云文件夹下的文件、文件夹
  async getFilesByFolder(prefix){
    return this.CDN.getFilesByFolder(prefix);
  }

  // 删除文件
  async deleteFile(path){
    return this.CDN.deleteFile(path);
  }
}

module.exports = Cloud;
