import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import store from "@/store";
import { RespData } from "@/store/respTypes";

export type ICustomAxiosRequestConfig = AxiosRequestConfig & {
  opName?: string;
};

let baseH5URL = "";
let baseURL = "";

if (process.env.NODE_ENV === "development" || process.env.VUE_APP_STAGINE) {
  baseH5URL = "http://127.0.0.1:7002/";
  baseURL = "http://127.0.0.1:7001/";
} else {
  baseH5URL = "http://120.26.167.109:7002/";
  baseURL = "http://120.26.167.109:7001/";
}

export { baseH5URL, baseURL };

console.log("_NODE ENV", process.env.NODE_ENV);
console.log("_VUE_APP_FOO", process.env.VUE_APP_FOO);
console.log("_VUE_APP_STAGINE", process.env.VUE_APP_STAGINE);

//  导出 Request , 用来自定义传递配置来创建实例
export class Request {
  instance: AxiosInstance;
  baseConfig: ICustomAxiosRequestConfig = {
    baseURL,
    timeout: 60000,
  };

  constructor(config: ICustomAxiosRequestConfig) {
    this.instance = axios.create(Object.assign(this.baseConfig, config));

    //  请求拦截
    this.instance.interceptors.request.use(
      (config: ICustomAxiosRequestConfig) => {
        //  loading数据添加
        if (config.opName) {
          store.commit("startLoading", { opName: config.opName });
        } else {
          store.commit("startLoading");
        }
        //  清空全局错误
        store.commit("setError", { status: false, message: "" });
        //  请求拦截: 一般添加 token, 用于服务端验证
        const token = localStorage.getItem("token") as string;
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      //  请求错误, 一般用于全局提示框进行提示
      (err: any) => {
        return Promise.reject(err);
      }
    );
    //  响应拦截
    this.instance.interceptors.response.use(
      (res: AxiosResponse<RespData<any>>) => {
        const { config, data } = res;
        //  loading数据删除
        const newConfig = config as ICustomAxiosRequestConfig;
        if (newConfig.opName) {
          store.commit("finishLoading", { opName: newConfig.opName });
        } else {
          store.commit("finishLoading");
        }
        if (data && data.errno === 0) {
          // 后端如果有自定义的 code 也可以在这里处理
          return data;
        } else {
          //  添加全局错误
          store.commit("setError", {
            status: true,
            message: data.message,
          });
          // antdMessage.warn(`${data.message}`);
          return Promise.reject(data);
        }
      },
      (err: AxiosError) => {
        const { config } = err;
        const newConfig = config as ICustomAxiosRequestConfig;
        if (newConfig.opName) {
          store.commit("finishLoading", { opName: newConfig.opName });
        } else {
          store.commit("finishLoading");
        }
        store.commit("setError", { status: true, message: "服务器错误" });
        return Promise.reject(err);

        //  处理常见的 http 错误, 进行全局提示
        // let message = "";
        // switch (err.response.status) {
        //   case 400:
        //     message = "请求错误";
        //     break;
        //   case 401:
        //     message = "未授权，请重新登录";
        //     // 这里可以做清空storage并跳转到登录页的操作
        //     break;
        //   case 403:
        //     message = "拒绝访问";
        //     break;
        //   case 404:
        //     message = "请求出错";
        //     break;
        //   case 408:
        //     message = "请求超时";
        //     break;
        //   case 500:
        //     message = "服务器错误";
        //     break;
        //   case 501:
        //     message = "服务未实现";
        //     break;
        //   case 502:
        //     message = "网络错误";
        //     break;
        //   case 503:
        //     message = "服务不可用";
        //     break;
        //   case 504:
        //     message = "网络超时";
        //     break;
        //   case 505:
        //     message = "HTTP版本不受支持";
        //     break;
        //   default:
        //     message = `连接出错(${err.response.status})!`;
        // }
        // 这里错误消息可以使用全局弹框展示出来
        // antdMessage.error(`${message}`);
      }
    );
  }

  request(config: ICustomAxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config);
  }

  get<T = any>(
    url: string,
    config?: ICustomAxiosRequestConfig
  ): Promise<RespData<T>> {
    return this.instance.get(url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: ICustomAxiosRequestConfig
  ): Promise<RespData<T>> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: ICustomAxiosRequestConfig
  ): Promise<RespData<T>> {
    return this.instance.put(url, data, config);
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: ICustomAxiosRequestConfig
  ): Promise<RespData<T>> {
    return this.instance.patch(url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: ICustomAxiosRequestConfig
  ): Promise<RespData<T>> {
    return this.instance.delete(url, config);
  }
}

export default new Request({});
