import { shallowMount, VueWrapper } from "@vue/test-utils";
import UploadFile from "@/components/UploadFile.vue";
import flushPromises from "flush-promises";
import axios from "axios";
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

let wrapper: VueWrapper<any>;
const testFile = new File(["xyz"], "test.png", { type: "image/png" });
describe(`UploadFile 组件测试`, () => {
  beforeAll(() => {
    jest.useFakeTimers();
    wrapper = shallowMount(UploadFile, {
      props: {
        action: "test.file",
      },
    });
  });

  it(`组件基本展示`, () => {
    expect(wrapper.get("button").text()).toBe("点击上传"); //  button 文案
    expect(wrapper.get("input").isVisible()).toBeFalsy(); //  input 隐藏
  });

  it(`组件行为测试 - 上传成功`, async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { status: "success" } });
    //  给 input 添加 files 属性, 如何模拟 file 文件
    const fileInput = wrapper.get("input").element as HTMLInputElement;
    const files = [testFile];
    Object.defineProperty(fileInput, "files", {
      value: files,
      writable: false, //  不可写
    });
    //  input change 触发
    expect(wrapper.get("button").text()).toBe("点击上传");
    await wrapper.get("input").trigger("change");
    expect(mockAxios.post).toBeCalledTimes(1);
    expect(wrapper.get("button").text()).toBe("正在上传");
    //  列表长度修改, 并且有正确的 class
    expect(wrapper.get("button").attributes()).toHaveProperty("disabled"); //  检验按钮 disabled 状态
    expect(wrapper.findAll("li").length).toBe(1);
    const firstItem = wrapper.find("li:first-child");
    expect(firstItem.classes()).toContain("upload-loading");
    await flushPromises();
    expect(wrapper.get("button").text()).toBe("点击上传");
    //  正确的 class, 并且文件名对应
    expect(firstItem.classes()).toContain("upload-success");
    expect(firstItem.get(".filename").text()).toBe(testFile.name);
  });

  it(`组件行为测试 - 上传失败`, async () => {
    mockAxios.post.mockRejectedValueOnce({ message: "操作失败" });
    await wrapper.get("input").trigger("change");
    expect(mockAxios.post).toBeCalledTimes(1);
    expect(wrapper.get("button").text()).toBe("正在上传");
    await flushPromises();
    await jest.runAllTimers();
    expect(wrapper.get("button").text()).toBe("点击上传");
    expect(wrapper.findAll("li").length).toBe(2);
    const lastItem = wrapper.find("li:last-child");
    expect(lastItem.classes()).toContain("upload-error");
    //  点击删除删除该项
    await lastItem.get(".delete-icon").trigger("click");
    expect(wrapper.findAll("li").length).toBe(1);
  });
  afterEach(() => {
    //  case 执行完 重置 mockAxios.post 重置
    mockAxios.post.mockReset();
  });
});
