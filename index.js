const Cloud = require("./cloud/cloud");
const Base = require("./base");


class Hsuc {
  constructor(options){
    let defaultOptions = {
      log: false,
      cover: false,
      disable: false,
      removePrevVersion: false,
    };
    this.options = Object.assign(defaultOptions, options);
  }

  apply(compiler){
    if(this.options.disable) return;
    if(!this.options.cloudFolder || !this.options.domain){
      console.warn("初始化时请传入“cloudFolder”和“domain”字段。本次打包将不上传");
      return;
    }
    if(/webpack-dev-server/.test(process.env.npm_lifecycle_script)){
      this.message("只有打包模式才会上传");
      return;
    }

    
    // 初始化
    this.options.cloudFolder = this.options.cloudFolder.replace(/([^/])$/, "$1/");
    this.options.domain = this.options.domain.replace(/([^/])$/, "$1/");
    this.options.path = compiler.options.output.path;

    compiler.options.output.publicPath = `${this.options.domain}${this.options.cloudFolder}`;

    // 打包完成后
    compiler.plugin('afterEmit', async compilation => {
      this.options.assets = compilation.assets;
      this.uploaded = 0;

      this.cloud = new Cloud(this.options);
      if(!this.cloud.CDN){
        console.warn("必须传入到云端的参数，目前支持aliyun,huawei,upyun,qiniu，也可以自定义上传文件。本次打包将不上传");
        return;
      }

      await this.upload(this.options.path);
      console.log("本地文件上传成功");

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
          case file.isFile() && !!assets[folder + file.name]:
            CDNPath = filePath.replace(this.options.path, this.options.cloudFolder.replace(/\/$/, ""));
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
      let path = this.options.cloudFolder,
        assets = this.options.assets,
        cloudFiles = await this.cloud.getFilesByFolder(path);

      for(let k in assets){
        cloudFiles = cloudFiles.filter(item =>
          item.name.replace(this.options.cloudFolder, "") !== k
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

