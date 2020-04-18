const Cloud = require("./cloud/cloud");
const Base = require("./base");


class Hsuc {
  constructor(options){
    let defaultOptions = {
      log: true,
      cover: false,
      enable: false,
      removePrevVersion: false,
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler){
    if(!this.options.enable) return;
    if(!this.options.cloudFolder || !this.options.domain){
      console.warn("初始化时请传入“cloudFolder”和“domain”字段。本次打包将不上传");
      return;
    }
    if(this.options.buildId === "development"){
      this.message("只有打包模式才会上传");
      return;
    }
    
    // 初始化
    this.options.cloudFolder = this.options.cloudFolder.replace(/([^/])$/, "$1/");
    this.options.domain = this.options.domain.replace(/([^/])$/, "$1/");
    this.options.path = compiler.options.output.path;

    // 打包完成后
    compiler.plugin('afterEmit', async compilation => {
      let {isServer} = this.options;
      global.uploadFiles = global.uploadFiles || new Set();

      // 本次打包的文件放到global.uploadFiles中
      for(let k in compilation.assets){
        let name = k.replace(/\\/g, "/");
        if(/^\.\.\/(static\/)/.test(name)){
          name = name.replace(/^\.\.\/(static\/)/, "$1");
        } else if(isServer){
          name = "server/" + name;
        }
        global.uploadFiles.add(name);
      }

      // 添加版本文件
      global.uploadFiles.add(`${isServer ? "server/" : ""}records.json`);
      if(!isServer){
        global.uploadFiles.add("BUILD_ID");
      } else {
        return;
      }

      this.options.assets = Array.from(global.uploadFiles);
      this.uploaded = 0;

      this.cloud = new Cloud(this.options);
      if(!this.cloud.CDN){
        console.warn("必须传入到云端的参数，目前支持aliyun,huawei,upyun,qiniu，也可以自定义上传文件。本次打包将不上传");
        return;
      }

      await this.upload(this.options.path);
      if(this.uploaded > 0) console.log("本地文件上传成功");

      if(!this.options.removePrevVersion) return;
      await this.remove();
      console.log("云端上个版本文件清除成功");
    });
  }

  // 日志
  message(){
    if(!this.options.log) return;

    let string = "";
    for(let i = 0; i < arguments.length; i++){
      string += arguments[i];
    }
    console.log(string);
  }

  // 上传文件、删除本地文件
  async upload(path, folder=""){
    try {
      let files = await Base.getReaddir(path, {withFileTypes: true}),
        assets = this.options.assets,
        result;
      if(!files || files.length === 0) return;

      for(let i = 0; i < files.length; i++){
        let file = files[i],
          filePath = `${path}/${file.name}`,
          CDNPath;
        result = undefined;
        if(/node_modules/.test(filePath)) continue;

        switch(true){
          case file.isFile() && assets.indexOf(folder + file.name) !== -1:
            CDNPath = this.options.cloudFolder + filePath.replace(this.options.dir, "").replace(/^[\\\/]/, "");
            result = await this.cloud.uploadFile(filePath, CDNPath, this.options.cover);
              ++this.uploaded;
            if(result){
              this.message(
                `上传文件[${this.uploaded}/${Object.keys(assets).length}]：`,
                folder + file.name,
                " ==>> ",
                (result === "exist" ? "存在，不上传 " : ""),
                this.options.domain + CDNPath,
              );
            }
            break;
          case file.isFile():
            await Base.delFile(filePath);
            // this.message("删除本地文件：", folder + file.name);
            break;
        }
        if(!file.isFile()) await this.upload(filePath, folder+file.name+"/");
      }
      result = await Base.delEmptyDir(path);
      // if(result) this.message("删除空文件夹：", path.replace(this.options.path, "").replace(/^[\/\\]+/, ""));
    } catch(err){
      throw err;
    }
  }

  // 删除云端文件
  async remove(){
    try {
      let path = this.options.cloudFolder + this.options.config.distDir + "/",
        assets = this.options.assets,
        cloudFiles = await this.cloud.getFilesByFolder(path);

      for(let i = 0; i < assets.length; i++){
        cloudFiles = cloudFiles.filter(item =>
          item.name.replace(this.options.cloudFolder+this.options.config.distDir+"/", "") !== assets[i]
        )
      }

      for(let i = 0; i < cloudFiles.length; i++){
        let name = cloudFiles[i].name,
          file = name.replace(this.options.cloudFolder, ""),
          result;
        if(!file) continue;

        result = await this.cloud.deleteFile(name);
        if(result){
          this.message(`云端文件删除[${i+1}/${cloudFiles.length}]：`, this.options.domain + name);
        }
      }
    } catch(err){
      throw err;
    }
  }
}


module.exports = Hsuc;

