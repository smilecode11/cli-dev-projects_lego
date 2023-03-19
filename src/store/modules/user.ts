import { Module, ActionContext } from "vuex";
import axios, { AxiosRequestConfig } from "axios";
import { GlobalDataProps } from "../index";
import UsersService from "@/axios/users";
import { RespData } from "../respTypes";

export interface UserDataProps {
  username?: string;
  id?: string;
  phoneNumber?: string;
  nickName?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
  iat?: number;
  exp?: number;
  picture?: string;
  gender?: string;
}

export interface UserProps {
  isLogin: boolean;
  data?: UserDataProps;
  token?: string;
}

//  第二步, 确定参数
// export const actionWrapper = (
//   url: string,
//   commitName: string,
//   conifg: AxiosRequestConfig = { method: "get" }
// ) => {
//   //  第一步: 不管三七二十一, 返回一个函数和原来函数处理一样
//   return async (context: ActionContext<any, any>, payload?: any) => {
//     //  第三步: 编写内部通用逻辑
//     const newConfig = { ...conifg, data: payload };
//     const { data } = await axios(url, newConfig);
//     context.commit(commitName, data);
//     return data;
//   };
// };

const user: Module<UserProps, GlobalDataProps> = {
  state: {
    isLogin: false,
    data: undefined,
    token: localStorage.getItem("token") || "",
  },
  mutations: {
    login: (state, rawData: RespData<{ token: string }>) => {
      const { token } = rawData.data;
      state.token = token;
      localStorage.setItem("token", token);
    },
    fetchCurrentUser(state, rawData: RespData<UserDataProps>) {
      state.isLogin = true;
      state.data = rawData.data;
    },
    logout: (state) => {
      state.isLogin = false;
      state.data = undefined;
      state.token = "";
      localStorage.removeItem("token"); //  登出需要清除 token
    },
  },
  actions: {
    async login({ commit }, payload) {
      const result = await UsersService.userLoginWithPhone(payload);
      commit("login", result);
    },
    // login: actionWrapper("/api/users/loginByCellphone", "login", {
    //   method: "post",
    // }),
    async fetchCurrentUser({ commit }) {
      const result = await UsersService.getUserInfo();
      commit("fetchCurrentUser", result);
    },
    // 登录并或存储登录用户信息
    loginAndFetchUserInfo({ dispatch }, payload) {
      return dispatch("login", payload).then(() => {
        return dispatch("fetchCurrentUser");
      });
    },
  },
};

export default user;
