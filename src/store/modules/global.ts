import { Module } from "vuex";
import { GlobalDataProps } from "../index";
export interface GlobalStatus {
  opNames: { [key: string]: boolean };
  requestNumber: number;
  error: {
    status: boolean;
    message?: string;
  };
  keepAliveList: string[];
}

const global: Module<GlobalStatus, GlobalDataProps> = {
  state: {
    opNames: {},
    requestNumber: 0,
    error: { status: false },
    keepAliveList: ["HomePage", "TemplateDetailPage", "WorksPage"],
  },
  mutations: {
    startLoading: (state, payload = {}) => {
      state.requestNumber++;
      if (payload.opName) {
        state.opNames[payload.opName] = true;
      }
    },
    finishLoading: (state, payload = {}) => {
      state.requestNumber--;
      if (payload.opName) {
        delete state.opNames[payload.opName];
      }
    },
    setError(state, e) {
      state.error = e;
    },
  },
  getters: {
    isLoading: (state) => state.requestNumber > 0, //  所有请求的 loading状态
    isOpLoading: (state) => (opName: string) => state.opNames[opName], //  精确某一个指定请求状态
  },
};

export default global;
