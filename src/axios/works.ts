import ApiService from "./index";
import { objectToQueryString } from "@/helper";

export class WorksAPi {
  /** 获取我的作品/模板*/
  fetchWorks({ searchParams }) {
    let url = `/api/works`;
    if (searchParams && Object.keys(searchParams).length) {
      url += `?${objectToQueryString(searchParams)}`;
    }
    return ApiService.get(url, {
      opName: "fetchWorks",
    });
  }

  /** 获取模板列表*/
  fetchTemplates({ searchParams }) {
    let url = `/api/templates`;
    if (searchParams && Object.keys(searchParams).length) {
      url += `?${objectToQueryString(searchParams)}`;
    }
    return ApiService.get(url, {
      opName: "fetchTemplates",
    });
  }

  /** 获取单个作品*/
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
