import ApiService from "./index";

export class UsersAPi {
  /** 获取短信验证码*/
  getVeriCode(data: { phoneNumber: string }) {
    return ApiService.post<{ veriCode: number }>(
      "/api/users/getVeriCode",
      data
    );
  }

  /** 手机+验证码完成登录*/
  userLoginWithPhone(data: { phoneNumber: string; veriCode: string }) {
    return ApiService.post<{ token: string }>(
      "/api/users/loginByCellphone",
      data
    );
  }

  /** 获取用户信息*/
  getUserInfo() {
    return ApiService.post(`/api/users/current`);
  }
}

export default new UsersAPi();
