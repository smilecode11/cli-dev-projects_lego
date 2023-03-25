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

  /** 发布作品*/
  publishWork({ id }) {
    return ApiService.post(`/api/publish/${id}`);
  }

  /** 获取作品的 channels*/
  fetchChannels({ id }) {
    return ApiService.get(`/api/channels/getWorkChannels/${id}`);
  }

  /** 创建作品的渠道*/
  createChannel({ name, workId }) {
    return ApiService.post(`/api/channels`, {
      name,
      workId,
    });
  }

  /** 删除作品渠道*/
  deleteChannel({ id }) {
    return ApiService.delete(`/api/channels/${id}`);
  }
}

export default new WorksAPi();
