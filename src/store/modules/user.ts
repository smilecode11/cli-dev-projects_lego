import { Module } from "vuex";
import { GlobalDataProps } from "../index";
import UsersService from "@/axios/users";

interface UserDataProps {
  nickName: string;
  avatar?: string;
  email?: string;
}

export interface UserProps {
  isLogin: boolean;
  data?: UserDataProps;
}

const user: Module<UserProps, GlobalDataProps> = {
  state: {
    isLogin: false,
    data: undefined,
  },
  mutations: {
    login: (state, payload) => {
      state.isLogin = true;
      state.data = payload;
    },
    logout: (state) => {
      state.isLogin = false;
      state.data = undefined;
      localStorage.removeItem("token"); //  登出需要清除 token
    },
  },
  actions: {
    async login({ commit }, payload) {
      // 获取 token, 存储 storage
      const result = await UsersService.userLoginWithPhone({
        phoneNumber: payload.cellphone,
        veriCode: payload.verifyCode,
      });
      const token = result.data.token;
      if (token) {
        localStorage.setItem("token", token);
        // 获取用户信息
        const userRes = await this.dispatch("getUserInfo");
        commit("login", userRes.data);
      }
    },
    async getUserInfo() {
      const userRes = await UsersService.getUserInfo();
      return userRes;
    },
  },
};

export default user;
