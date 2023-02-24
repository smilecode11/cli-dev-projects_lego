import { VueWrapper, mount } from "@vue/test-utils";
import InlineEdit from "@/components/InlineEdit.vue";

let wrapper: VueWrapper<any>;

describe("inlineEdit 组件测试", () => {
  beforeAll(() => {
    wrapper = mount(InlineEdit, {
      props: {
        value: "test",
      },
      slots: {
        default: "<template #default='{ text }'><h2>{{text}}</h2></template>",
      },
    });
  });

  // 默认状态
  it("测试行内编辑组件初始状态", () => {
    expect(wrapper.get("h2").text()).toBe("test");
  });

  // 测试状态变更
  it("测试点击组件时组件状态变更", async () => {
    await wrapper.trigger("click");
    expect(wrapper.find("input").exists()).toBeTruthy();
    const input = wrapper.get("input").element;
    expect(input.value).toBe("test");
  });
});
