import { computed } from "vue";
import { useStore } from "vuex";
import { KeyHandler, HotkeysEvent } from "hotkeys-js";
import useHotKeys from "@/hooks/useHotKey";
import { GlobalDataProps } from "@/store/index";

// 创建高阶函数: 阻止浏览器默认行为
const wrap = (callback: KeyHandler) => {
  const wrapperFn = (e: KeyboardEvent, event: HotkeysEvent) => {
    e.preventDefault();
    callback(e, event);
  };
  return wrapperFn;
};

export default function initHotKeys() {
  const store = useStore<GlobalDataProps>();
  const currentId = computed(() => store.state.editor.currentElement);
  //  拷贝
  useHotKeys("ctrl+c, command+c", () => {
    store.commit("editor/copyComponent", currentId.value);
  });
  //  粘贴
  useHotKeys("ctrl+v, command+v", () => {
    store.commit("editor/pasteCopiedComponent");
  });
  //  删除
  useHotKeys("backspace, delete", () => {
    store.commit("editor/deleteComponent", currentId.value);
  });
  //  取消选择
  useHotKeys("esc", () => {
    store.commit("editor/setActive", "");
  });
  useHotKeys(
    "up",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Up",
        amount: 1,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "down",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Down",
        amount: 1,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "left",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Left",
        amount: 1,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "right",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Right",
        amount: 1,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "shift+up",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Up",
        amount: 10,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "shift+down",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Down",
        amount: 10,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "shift+left",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Left",
        amount: 10,
        id: currentId.value,
      });
    })
  );
  useHotKeys(
    "shift+right",
    wrap(() => {
      store.commit("editor/moveComponent", {
        direction: "Right",
        amount: 10,
        id: currentId.value,
      });
    })
  );
}
