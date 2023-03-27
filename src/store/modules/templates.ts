import { ActionContext, Module } from "vuex";
import { GlobalDataProps } from "../index";
import ApiService from "@/axios/index";
import axios, { AxiosRequestConfig } from "axios";
import { RespListData, RespData } from "@/store/respTypes";
import { PageData } from "./editor";
import { objectToQueryString } from "@/helper";

export interface ActionPayload {
  urlParams?: { [key: string]: any };
  searchParams?: { [key: string]: any };
  data?: any;
}
//第二步，确定参数
export function actionWrapper(
  url: string,
  commitName: string,
  config: AxiosRequestConfig = { method: "get" }
) {
  // 第一步 不管三七二十一，先返回一个函数和原来的函数处理一摸一样
  return async (
    context: ActionContext<any, any>,
    payload: ActionPayload = {}
  ) => {
    //第三部 写内部重复的逻辑
    const { /* urlParams, */ data, searchParams } = payload;
    const newConfig = { ...config, data, opName: commitName };
    let newURL = url;
    // if (urlParams) {
    //   const toPath = compile(url, { encode: encodeURIComponent })
    //   newURL = toPath(urlParams)
    //   console.log(newURL)
    // }
    if (searchParams) {
      newURL += "?" + objectToQueryString(searchParams);
    }
    const resp = await axios(newURL, newConfig);
    context.commit(commitName, { payload, ...resp.data });
    return resp.data;
  };
}

export type TemplateProps = Required<Omit<PageData, "props" | "setting">>;

export interface TemplatesProps {
  data: TemplateProps[];
  totalTemplates: number;
}

//  测试数据
export const testData: TemplateProps[] = [];

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
    totalTemplates: 0,
  },
  actions: {
    async fetchTemplates(context, { searchParams, loadMore = false }) {
      let url = "/api/templates";
      let queryString = "";
      if (searchParams) {
        queryString = objectToQueryString(searchParams);
        url = url + "?" + queryString;
      }
      const result = await ApiService.get(`${url}`, {
        opName: "fetchTemplates",
      });
      if (loadMore) {
        context.commit("fetchMoreTemplates", result);
      } else {
        context.commit("fetchTemplates", result);
      }
    },
    async fetchTemplate({ commit }, { id }) {
      const result = await ApiService.get(`api/templates/${id}`);
      commit("fetchTemplate", result);
      return result.data;
    },
  },
  getters: {
    //  获取模板数据 & id
    getTemplateById:
      (state /* , getters, rootState, rootGetters */) => (id: number) => {
        return state.data.find((t) => t.id === id);
      },
  },
  mutations: {
    fetchTemplates: (state, rawData: RespListData<TemplateProps>) => {
      const { list, count } = rawData.data;
      state.data = list;
      state.totalTemplates = count;
    },
    fetchMoreTemplates: (state, rawData: RespListData<TemplateProps>) => {
      const { list, count } = rawData.data;
      state.data = [...state.data, ...list];
      state.totalTemplates = count;
    },
    fetchTemplate: (state, rawData: RespData<TemplateProps>) => {
      state.data = [rawData.data];
    },
  },
};

export default templates;
