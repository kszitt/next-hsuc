## 描述
将webpack打包生成的文件上传到云端，以提高加载速度   
目前，支持阿里云、华为云、七牛云和又拍云，以及自定义扩展。 

## 安装
```bash
npm install hsuc --save-dev
```

## 要求
### Node
Node.js >= 10.10.0 required

## 使用
#### webpack配置文件
```bash
// webpack.config.js
const Hsuc = require('hsuc');

...
plugins: [
  ...
  new Hsuc({
    cloudFolder: "<云端文件夹>",
    domain: "<域名>",
    // 阿里云（任选其一）
    aliyun: {
      region: "<OSS region>",
      accessKeyId: "<Your accessKeyId>",
      accessKeySecret: "<Your accessKeySecret>",
      bucket: "<Your bucket name>"
    }
    // 华为云（任选其一）
    huawei: {
      accessKeyId: "<Provide your Access Key>",
      secretAccessKey: "<Provide your Secret Key>",
      server: "<https://your-endpoint>",
      bucket: "<Bucket>"
    },
    // 七牛云（任选其一）
    qiniu: {
      accessKey: "<ACCESS_KEY>",
      secretKey: "<SECRET_KEY>",
      bucket: "<Bucket>"
    },
    // 又拍云（任选其一）
    upyun: {
      serviceName: "<service name>",
      operatorName: "<operator name>",
      operatorPassword: "<operator password>",
    }
  })
]
```

## hsuc(options)支持的选项
- `aliyun` - 初始化阿里云OSS参数。
- `huawei` - 初始化华为云OBS参数。
- `qiniu` - 初始化七牛云参数。
- `upyun` - 初始化又拍云参数。
- `disable[boolean]` - 是否禁用，默认`false`。
- `removePrevVersion[boolean]` - 是否删除云端以前的版本，默认`false`
- `log[boolean]` - 是否显示日志，默认`false`
- `cover[boolean|RegExp]` - 图片、字体文件是否覆盖，默认`false`，填写正则时可以参考`/\.(png|jpe?g|gif|ico|woff2?|svg|ttf|eot)$/`。
- `custom[js文件，例如require("./template.js")]` - 自定义上传文件，可以参照项目中的文件`template.js`文件，能够作为除`aliyun huawei qiniu upyun`之外的扩展或修改。


## 对象存储CORS规则设置
- `aliyun` 按照[设置CORS](https://help.aliyun.com/document_detail/44570.html?spm=5176.8465980.0.0.12871450vh6n2z)设置CORS
- `huawei` 按照[配置桶的CORS](https://support.huaweicloud.com/sdk-browserjs-devg-obs/obs_24_0201.html)中“通过OBS Browser配置桶的CORS”设置
- `qiniu` 按照[CORS 跨域共享](https://console.upyun.com/services/kszitt/antileechFile/)设置
- `upyun` 按照[CORS 跨域配置](http://docs.upyun.com/cdn/feature/#cors)设置

## 注意事项
- <label style="color:red">云端访问权限请设置为“公共读写”或者“公共读”</label>
- `options`参数中`aliyun`、`huawei`、`qiniu`和`upyun`同时配置只有第一个有效
- `options.disable` 该插件在非打包模式时禁用
- `options.deletePrevBuildFile` 启用该项会把以前的版本删掉，建议在服务器定期清理。

#### 部署
``` hash
webpack
// 将打包文件夹下的index.html文件部署到服务器，即可访问
```

