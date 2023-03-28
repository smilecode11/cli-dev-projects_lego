const isStaging = !!process.env.VUE_APP_STAGING //  预发环境 - 测试接口地址, 生产打包
const isProduction = process.env.NODE_ENV === "production"  //  生产环境 - 生产地址, 生产打包

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  // 生产环境使用 OSS 地址, 测试环境使用绝对路径
  publicPath: (isProduction && !isStaging) ? "https://oss.smiling-code.com/editor" : "/",  //  默认值是 /, 部署在根目录上
  // 修改主题, 设置 ant-design-vue 主题样式
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#1DA57A',
            'link-color': '#1DA57A',
            'border-radius-base': '2px',
          },
          javascriptEnabled: true,
        },
      },
    },
  },
});
