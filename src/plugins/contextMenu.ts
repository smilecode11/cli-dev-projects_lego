import { onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store";
import createContextMenu, { ActionItem } from "@/components/createContextMenu";

const initContextMenu = () => {
  const store = useStore<GlobalDataProps>();
  const contextMenuActions: ActionItem[] = [
    {
      text: "复制组件",
      shortcut: "Copy",
      action: (cid) => {
        store.commit("editor/copyComponent", cid);
        console.log("_复制图层 action", cid);
      },
    },
    {
      text: "删除组件",
      shortcut: "Backspace/Delete",
      action: (cid) => store.commit("editor/deleteComponent", cid),
    },
  ];
  let destoryFunc: any;
  onMounted(() => {
    destoryFunc = createContextMenu(contextMenuActions, "edit-wrapper");
  });
  onUnmounted(() => {
    destoryFunc(); //  销毁组件实例
  });
};

export default initContextMenu;
