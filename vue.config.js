const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production"; //  生产环境 - 生产地址, 生产打包
const isStaging = !!process.env.VUE_APP_STAGING; //  预发环境 - 测试接口地址, 生产打包
const isAnalyzeMode = !!process.env.ANALYZE_MODE; //  分析环境

console.log("_isProduction", isProduction);
console.log("_isStaging", isStaging);
console.log("_isAnalyzeMode", isAnalyzeMode);

module.exports = defineConfig({
  // 生产环境使用 OSS 地址, 测试环境使用绝对路径
  publicPath:
    isProduction && !isStaging ? "https://oss.smiling-code.com/editor" : "/", //  默认值是 /, 部署在根目录上
  // 修改主题, 设置 ant-design-vue 主题样式
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            "primary-color": "#1DA57A",
            "link-color": "#1DA57A",
            "border-radius-base": "2px",
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  configureWebpack: (config) => {
    if (isAnalyzeMode) {
      //  执行 analyze 环境时, 打开bundle进行分析
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
        })
      );
    }
    if (isProduction) {
      //  配置自动生成 gzip 文件
      config.plugins.push(
        new CompressionPlugin({
          algorithm: "gzip", //  使用算法
          test: /\.js$|\.html$|\.json$|\.css/, //  匹配文件
          threshold: 10240, // 限制10k 以上进行 gzip 文件生成
        })
      );
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );
    // 自动分割 chunks
    config.optimization.splitChunks = {
      maxInitialRequests: Infinity,
      minSize: 300 * 1024, //  限制大小
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = (module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            ) || [])[1];
            return packageName ? `npm.${packageName.replace("@", "")}` : "";
          },
        },
      },
    };
  },
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "慕课乐高";
      args[0].desc = "一键生成 H5 海报";
      return args;
    });
  },
});
