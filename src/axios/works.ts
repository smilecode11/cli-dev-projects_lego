import ApiService from "./index";

export class WorksAPi {
  /** 获取单个作品数据*/
  fetchWork(id: string) {
    return ApiService.get(`/api/works/${id}`, { opName: "fetchWork" });
  }

  /** 保存作品*/
  saveWork({ id, data }) {
    return ApiService.patch(`/api/works/${id}`, data, {
      opName: "saveWork",
    });
  }
}

export default new WorksAPi();
