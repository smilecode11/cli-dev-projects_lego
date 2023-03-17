import { Module } from "vuex";
import { GlobalDataProps } from "../index";
import ApiService from "@/axios/index";
import { RespListData } from "@/store/respTypes";

export interface TemplateProps {
  id: number;
  title: string;
  coverImg: string;
  author: string;
  copiedCount: number;
  isHot?: boolean;
  isNew?: boolean;
  desc?: string;
}

export interface TemplatesProps {
  data: TemplateProps[];
}

//  测试数据
export const testData: TemplateProps[] = [
  { id: 1, title: "title1", coverImg: "", author: "", copiedCount: 0 },
  { id: 2, title: "title2", coverImg: "", author: "", copiedCount: 0 },
  { id: 3, title: "title3", coverImg: "", author: "", copiedCount: 0 },
  { id: 4, title: "title4", coverImg: "", author: "", copiedCount: 0 },
];

const templates: Module<TemplatesProps, GlobalDataProps> = {
  state: {
    data: [],
  },
  actions: {
    fetchTemplates(context) {
      ApiService.get(`/api/templates?pageSize=8&pageIndex=0`).then((resp) => {
        console.log("_actions fetchTemplates", resp);
        context.commit("fetchTemplates", resp);
      });
    },
  },
  getters: {
    //  获取模板数据 & id
    getTemplateById:
      (state /* , getters, rootState, rootGetters */) => (id: number) => {
        // rootState.user.data?.nickName;
        return state.data.find((t) => t.id === id);
      },
  },
  mutations: {
    fetchTemplates: (state, payload: RespListData<TemplateProps>) => {
      state.data = payload.data.list;
    },
  },
};

export default templates;
