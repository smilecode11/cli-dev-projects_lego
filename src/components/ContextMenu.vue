<template>
  <div class="context-menu-component menu-container" ref="menuRef">
    <ul class="ant-menu-light ant-menu-root ant-menu ant-menu-vertical">
      <li
        v-for="(action, index) in actions"
        :key="index"
        @click="action.action(componentId)"
        class="ant-menu-item"
      >
        <span class="item-text">{{ action.text }}</span>
        <span class="item-shortcut">{{ action.shortcut }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, onUnmounted } from "vue";
import { ActionItem } from "@/components/createContextMenu";
import { getParentElement } from "@/helper";
export default defineComponent({
  props: {
    actions: {
      type: Array as PropType<ActionItem[]>,
      required: true,
    },
    triggerClass: {
      type: String,
      default: "edit-wrapper",
    },
  },
  setup(props) {
    const menuRef = ref<null | HTMLElement>(null);
    const componentId = ref("");
    const triggerContextMenu = (e: MouseEvent) => {
      const domElement = menuRef.value as HTMLElement; //  菜单节点
      //  获取触发的菜单元素
      const wrapperElement = getParentElement(
        e.target as HTMLElement,
        props.triggerClass
      );
      if (wrapperElement) {
        e.preventDefault(); //  阻止默认右键
        domElement.style.display = "block";
        domElement.style.left = `${e.pageX}px`;
        domElement.style.top = `${e.pageY}px`;
        const cid = wrapperElement.dataset.componentId;
        if (cid) {
          componentId.value = cid;
        }
      }
    };

    const handleClick = () => {
      const domElement = menuRef.value as HTMLElement;
      domElement.style.display = "none";
    };

    onMounted(() => {
      document.addEventListener("contextmenu", triggerContextMenu);
      document.addEventListener("click", handleClick);
    });

    onUnmounted(() => {
      document.removeEventListener("contextmenu", triggerContextMenu);
      document.removeEventListener("click", handleClick);
    });

    return {
      menuRef,
      componentId,
    };
  },
});
</script>

<style>
.menu-container {
  display: none;
  position: absolute;
  background: #fff;
  z-index: 2000;
  width: 220px;
  border: 1px solid #ccc;
}
.menu-container .ant-menu-item {
  display: flex;
  justify-content: space-between;
}
.menu-container .ant-menu-item:hover {
  background: #efefef;
}
.ant-menu-item .item-shortcut {
  color: #ccc;
}
</style>
