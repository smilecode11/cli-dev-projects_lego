import { Module } from "vuex";
import { GlobalDataProps } from "../index";

interface UserDataProps {
  nickName: string;
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
    login: (state) => {
      state.isLogin = true;
      state.data = { nickName: "smiling." };
    },
    logout: (state) => {
      state.isLogin = false;
      state.data = undefined;
    },
  },
};

export default user;
