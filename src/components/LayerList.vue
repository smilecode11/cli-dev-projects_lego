<template>
  <ul class="ant-list-items">
    <li
      class="ant-list-item"
      v-for="item in list"
      :key="item.id"
      :class="{ active: item.id === selectedId }"
      @click="handleClick(item.id)"
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
import { defineComponent, PropType } from "vue";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DragOutlined,
} from "@ant-design/icons-vue";
import InlineEdit from "@/components/InlineEdit.vue";
import { ComponentProps } from "@/store/modules/editor";

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
  emits: ["change", "select"],
  setup(props, context) {
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
