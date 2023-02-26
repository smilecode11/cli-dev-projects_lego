<template>
  <ul class="ant-list-items" @dragover="onDragOver" @drop="onDrop">
    <li
      class="ant-list-item"
      v-for="(item, index) in list"
      :key="item.id"
      :class="{
        active: item.id === selectedId,
        ghost: dragData.currentDragging === item.id,
      }"
      @click="handleClick(item.id)"
      :draggable="true"
      @dragstart="onDragStart($event, item.id, index)"
      @dragenter="onDragEnter($event, index)"
    >
      <a-tooltip :title="item.isHidden ? '显示' : '隐藏'">
        <a-button
          shape="circle"
          @click.stop="handleChange(item.id, 'isHidden', !item.isHidden)"
        >
          <template v-slot:icon v-if="item.isHidden"><EyeOutlined /> </template>
          <template v-slot:icon v-else><EyeInvisibleOutlined /> </template>
        </a-button>
      </a-tooltip>
      <a-tooltip :title="item.isLocked ? '解锁' : '锁定'">
        <a-button
          shape="circle"
          @click.stop="handleChange(item.id, 'isLocked', !item.isLocked)"
        >
          <template v-slot:icon v-if="item.isLocked"
            ><UnlockOutlined />
          </template>
          <template v-slot:icon v-else><LockOutlined /> </template>
        </a-button>
      </a-tooltip>
      <inline-edit
        :value="item.layerName"
        @change="(value) => handleChange(item.id, 'layerName', value)"
      >
      </inline-edit>
      <a-tooltip title="拖拽排序">
        <DragOutlined />
      </a-tooltip>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DragOutlined,
} from "@ant-design/icons-vue";
import InlineEdit from "@/components/InlineEdit.vue";
import { ComponentProps } from "@/store/modules/editor";
import { getParentElement } from "@/helper";
import { arrayMoveMutable } from "array-move";

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<ComponentProps[]>,
      required: true,
    },
    selectedId: {
      type: String,
      required: true,
    },
  },
  emits: ["change", "select", "drop"],
  setup(props, context) {
    const dragData = reactive({
      currentDragging: "",
      currentIndex: -1,
    });
    let start = -1;
    let end = -1;
    const onDragStart = (e: DragEvent, id: string, index: number) => {
      dragData.currentDragging = id;
      dragData.currentIndex = index;
      start = index;
    };
    const onDragEnter = (e: DragEvent, index: number) => {
      if (index !== dragData.currentIndex) {
        console.log("_enter", index, dragData.currentIndex);
        // 变更 drag 状态
        arrayMoveMutable(props.list, dragData.currentIndex, index);
        console.log("_props.list", props.list);
        dragData.currentIndex = index;
        end = index;
      }
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      dragData.currentDragging = "";
      context.emit("drop", { start, end });
    };

    const handleClick = (id: string) => {
      context.emit("select", id);
    };

    const handleChange = (id: string, key: string, value: boolean) => {
      const data = {
        id,
        key,
        value,
        isRoot: true,
      };
      context.emit("change", data);
    };

    return {
      handleClick,
      handleChange,
      dragData,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDrop,
    };
  },
  components: {
    EyeOutlined,
    EyeInvisibleOutlined,
    LockOutlined,
    UnlockOutlined,
    DragOutlined,
    InlineEdit,
  },
});
</script>

<style>
.ant-list-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 15px;
  transition: all 0.5s ease-out;
  cursor: pointer;
  justify-content: normal;
  border: 1px solid #fff;
  border-bottom-color: #f0f0f0;
}

.ant-list-item.active {
  border: 1px solid #1890ff;
}

.ant-list-item:hover {
  background: #e6f7ff;
}

.ant-list-item.ghost {
  opacity: 0.5;
}

.ant-list-item > * {
  margin-right: 10px;
}
.ant-list-item button {
  font-size: 12px;
}

.ant-list-item .handle {
  cursor: move;
  margin-left: auto;
}
.ant-list-item .edit-area {
  width: 100%;
}
</style>
