import { render, createVNode } from "vue";
import ContextMenu from "@/components/ContextMenu.vue";

export interface ActionItem {
  action: (cid?: string) => void;
  text: string;
  shortcut: string;
}

const createContextMenu = (
  actions: ActionItem[],
  triggerClass = "editor-wrap"
) => {
  const container = document.createElement("div");
  const options = {
    actions,
    triggerClass,
  };
  const vm = createVNode(ContextMenu, options);
  render(vm, container);
  document.body.appendChild(container);
  // 闭包: 提供销毁组件能力
  return () => {
    render(null, container); //  销毁组件实例
    document.body.removeChild(container); //  移除元素
  };
};

export default createContextMenu;
