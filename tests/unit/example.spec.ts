import { shallowMount } from "@vue/test-utils";
import Hello from "@/components/Hello";

describe("HelloWorld.vue", () => {
  it("renders props.msg when passed", async () => {
    const msg = "Hello, Vue Test Unit";
    const wrapper = shallowMount(Hello, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
    // console.log(wrapper.html());
    // 触发事件
    const countBtn = wrapper.get("button.count-btn");
    expect(countBtn).toBeTruthy();
    await countBtn.trigger("click");
    const countWrap = wrapper.get("p.count-wrap");
    expect(countWrap).toBeTruthy();
    console.log(countWrap.text());
  });

  it("触发事件", () => {
    console.log("loading...");
  });
});
