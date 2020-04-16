

module.exports = class XXXClass {
  constructor(options) {
    // 初始化对象
    // this.xxx = ...;
  }

  // 文件是否存在。（存在返回true，不存在返回false，不能修改函数名）
  async exist(path, CDNPath){
    try {

    } catch(err) {
      return false;
    }
  }

  // 上传文件。（成功返回true,失败false，不能修改函数名）
  async upload(path, CDNPath){
    try {

    } catch(err){
      throw err;
    }
  }

  // Promise函数。（对于不支持promise的SDK,可以使用，可以删除）
  promise(){
    return new Promise(((resolve, reject) => {

    }))
  }

  // 云端文件夹下所有的文件列表。（返回的列表中name为文件名，不能修改函数名）
  async getFilesByFolder(prefix){
    try {

    } catch(err){
      throw err;
    }
  }

  // 删除文件。（成功返回true,失败false，不能修改函数名）
  async deleteFile(path){
    try {

    } catch(err){
      throw err;
    }
  }
}
