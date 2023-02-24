import axios from "axios";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { message as antdMessage } from "ant-design-vue";

type Result<T> = {
  errno: number | string;
  data: T;
  message: string;
};

//  导出 Request , 用来自定义传递配置来创建实例
export class Request {
  instance: AxiosInstance;
  baseConfig: AxiosRequestConfig = {
    baseURL: "http://127.0.0.1:7001/",
    timeout: 60000,
  };

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(Object.assign(this.baseConfig, config));

    //  请求拦截
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        //  请求拦截: 一般添加 token, 用于服务端验证
        const token = localStorage.getItem("token") as string;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      //  请求错误, 一般用于全局提示框进行提示
      (err: any) => Promise.reject(err)
    );
    //  响应拦截
    this.instance.interceptors.response.use(
      (res: AxiosResponse<Result<any>>) => {
        // 直接返回 res, 也可以返回 res.data
        // 后盾如果有自定义的 code 也可以在这里处理
        if (res && res.status === 200) {
          if (res.data && res.data.errno === 0) {
            return res.data;
          } else {
            antdMessage.warn(`${res.data.message}`);
            return Promise.reject(res);
          }
        } else {
          return Promise.reject(res);
        }
      },
      (err: any) => {
        //  处理常见的 http 错误, 进行全局提示
        let message = "";
        switch (err.response.status) {
          case 400:
            message = "请求错误";
            break;
          case 401:
            message = "未授权，请重新登录";
            // 这里可以做清空storage并跳转到登录页的操作
            break;
          case 403:
            message = "拒绝访问";
            break;
          case 404:
            message = "请求出错";
            break;
          case 408:
            message = "请求超时";
            break;
          case 500:
            message = "服务器错误";
            break;
          case 501:
            message = "服务未实现";
            break;
          case 502:
            message = "网络错误";
            break;
          case 503:
            message = "服务不可用";
            break;
          case 504:
            message = "网络超时";
            break;
          case 505:
            message = "HTTP版本不受支持";
            break;
          default:
            message = `连接出错(${err.response.status})!`;
        }
        // 这里错误消息可以使用全局弹框展示出来
        antdMessage.error(`${message}`);
        return Promise.reject(err.response);
      }
    );
  }

  request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.instance.get(url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.instance.post(url, data, config);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.instance.put(url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.instance.delete(url, config);
  }
}

export default new Request({});
