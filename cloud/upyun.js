const Upyun = require('upyun');
const Base = require('../base');

class UpyunCloud {
  constructor(options) {
    let service = new Upyun.Service(
      options.serviceName,
      options.operatorName,
      options.operatorPassword
    );
    this.upyun = new Upyun.Client(service);
    this.options = options;
  }

  async exist(path, CDNPath){
    try {
      let files = (await this.upyun.listDir(CDNPath)).files;
      if(files.length > 0){
        return true;
      }
    } catch(err) {
      return false;
    }
  }

  async upload(path, CDNPath){
    try {
      let content = await Base.getReadFile(path, null),
        result = await this.upyun.putFile(CDNPath, content);
      if(typeof result === "boolean") return result;
      if(typeof result === "object"){
        if(result["file-type"]) return true;
        throw result;
      }
    } catch(err){
      throw err;
    }
  }

  async getFilesByFolder(prefix){
    try {
      let _this = this,
        files=[];
      async function getFiles(path){
        let now_files = (await _this.upyun.listDir(path)).files;
        for(let item of now_files){
          if(item.type === "N"){
            item.name = `${path.replace(/\/$/, "")}/${item.name}`;
            files.push(item);
          } else if(item.type === "F"){
            await getFiles(`${path.replace(/\/$/, "")}/${item.name}`);
          }
        }
      }
      await getFiles(prefix);
      return files;
    } catch(err) {
      throw err;
    }
  }

  async deleteFile(path){
    try {
      return await this.upyun.deleteFile(path);
    } catch(err) {
      throw err;
    }
  }
}

module.exports = UpyunCloud;
