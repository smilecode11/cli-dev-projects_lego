import { ActionContext, Module } from "vuex";
import { GlobalDataProps } from "../index";
import ApiService from "@/axios/index";
import WorkApi from "@/axios/works";
import { RespListData, RespData } from "@/store/respTypes";
import { PageData } from "./editor";

export interface ActionPayload {
  urlParams?: { [key: string]: any };
  searchParams?: { [key: string]: any };
  data?: any;
  loadMore?: boolean;
}

/** 高阶函数: action 封装*/
//第二步，确定参数
export function actionWrapper(ServiceName: any, commitName: string) {
  // 第一步 不管三七二十一，先返回一个函数和原来的函数处理一摸一样
  return async (
    context: ActionContext<any, any>,
    payload: ActionPayload = {}
  ) => {
    //第三步 写内部重复的逻辑
    const resp = await ServiceName[commitName](payload);
    context.commit(commitName, { ...payload, ...resp });
    return resp.data;
  };
}

export type TemplateProps = Required<Omit<PageData, "props" | "setting">>;

export interface TemplatesProps {
  data: TemplateProps[];
  totalTemplates: number;
  works: TemplateProps[];
  totalWorks: number;
}

//  测试数据
export const testData: TemplateProps[] = [];

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
    totalTemplates: 0,
    works: [],
    totalWorks: 0,
  },
  actions: {
    fetchWorks: actionWrapper(WorkApi, "fetchWorks"), //  获取我的作品
    fetchTemplates: actionWrapper(WorkApi, "fetchTemplates"), //  获取模板列表
    // async fetchTemplates(context, { searchParams = {}, loadMore = false }) {
    //   const result = await WorkApi.fetchTemplates({ searchParams });
    //   context.commit("fetchTemplates", { ...result, loadMore });
    //   return result.data;
    // },
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
    fetchTemplates: (
      state,
      rawData: RespListData<TemplateProps> & { loadMore: boolean }
    ) => {
      const { loadMore, data } = rawData;
      const { list, count } = data;
      state.totalTemplates = count;
      if (!loadMore) {
        state.data = list;
      } else {
        state.data = [...state.data, ...list];
      }
    },
    fetchWorks: (
      state,
      rawData: RespListData<TemplateProps> & { loadMore: boolean }
    ) => {
      const { loadMore, data } = rawData;
      const { list, count } = data;
      state.totalWorks = count;
      if (!loadMore) {
        state.works = list;
      } else {
        state.works = [...state.works, ...list];
      }
    },
    fetchTemplate: (state, rawData: RespData<TemplateProps>) => {
      state.data = [rawData.data];
    },
  },
};

export default templates;
