<template>
  <div
    @click="onItemClick(id)"
    @mousedown="startMove"
    class="edit-wrapper"
    :class="{ actived: active, hidden: hidden }"
    :style="styles"
    ref="editWrapper"
  >
    <div class="slot-control">
      <slot></slot>
    </div>
    <div class="resizers">
      <div
        class="resizer top-left"
        @mousedown.stop="startResize('top-left')"
      ></div>
      <div
        class="resizer top-right"
        @mousedown.stop="startResize('top-right')"
      ></div>
      <div
        class="resizer bottom-left"
        @mousedown.stop="startResize('bottom-left')"
      ></div>
      <div
        class="resizer bottom-right"
        @mousedown.stop="startResize('bottom-right')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, nextTick } from "vue";
import { pick } from "lodash-es";
export type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface OriginalPositions {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export default defineComponent({
  emits: ["set-active", "update-position"],
  props: {
    id: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    props: {
      type: Object,
    },
  },
  setup(props, context) {
    //  设置当前操作组件
    const onItemClick = (id: string) => {
      context.emit("set-active", id);
    };

    // 获取组件位置及宽高, 赋予 wrapper style
    const styles = computed(() =>
      pick(props.props, ["position", "top", "left", "width", "height"])
    );

    // 组件拖动
    let isMoving = false;
    const gap = { x: 0, y: 0 }; //  存储移动偏移量
    //  计算获得鼠标拖动偏移量
    const caculateMovePosition = (e: MouseEvent) => {
      const container = document.getElementById("canvas-area") as HTMLElement;
      const left = e.clientX - gap.x - container.offsetLeft;
      const top = e.clientY - gap.y - container.offsetTop + container.scrollTop;
      return {
        left,
        top,
      };
    };

    const editWrapper = ref<null | HTMLElement>(null);
    const startMove = (e: MouseEvent) => {
      e.preventDefault();
      const currentElement = editWrapper.value;
      if (currentElement) {
        const { left, top } = currentElement.getBoundingClientRect();
        gap.x = e.clientX - left;
        gap.y = e.clientY - top;
      }
      const handleMove = (e: MouseEvent) => {
        const { left, top } = caculateMovePosition(e);
        isMoving = true;
        if (currentElement) {
          currentElement.style.top = top + "px";
          currentElement.style.left = left + "px";
        }
      };
      const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", handleMove);
        if (isMoving) {
          const { left, top } = caculateMovePosition(e);
          context.emit("update-position", { left, top, id: props.id });
          isMoving = false;
        }
        nextTick(() => {
          document.removeEventListener("mouseup", handleMouseUp);
        });
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    //  计算获得大小变化前后组件的 width/height/left/top 值
    const caculateSize = (
      direction: ResizeDirection,
      e: MouseEvent,
      positions: OriginalPositions
    ) => {
      const { clientX, clientY } = e;
      const { left, right, top, bottom } = positions;
      const container = document.getElementById("canvas-area") as HTMLElement;
      const rightWidth = clientX - left;
      const leftWidth = right - clientX;
      const bottomHeight = clientY - top;
      const topHeight = bottom - clientY;
      const topOffset = clientY - container.offsetTop + container.scrollTop;
      const leftOffset = clientX - container.offsetLeft;
      switch (direction) {
        case "top-left":
          return {
            width: leftWidth,
            height: topHeight,
            top: topOffset,
            left: leftOffset,
          };
        case "top-right":
          return {
            width: rightWidth,
            height: topHeight,
            top: topOffset,
          };
        case "bottom-right":
          return {
            width: rightWidth,
            height: bottomHeight,
          };
        case "bottom-left":
          return {
            width: leftWidth,
            height: bottomHeight,
            left: leftOffset,
          };
        default:
          break;
      }
    };
    // 组件大小改变
    const startResize = (direction: ResizeDirection) => {
      const currentElement = editWrapper.value as HTMLElement;
      const { left, right, top, bottom } =
        currentElement.getBoundingClientRect();

      const handleMove = (e: MouseEvent) => {
        const size = caculateSize(direction, e, { left, right, top, bottom });
        const { style } = currentElement;
        if (size) {
          style.width = size.width + "px";
          style.height = size.height + "px";
          if (size.left) {
            style.left = size.left + "px";
          }
          if (size.top) {
            style.top = size.top + "px";
          }
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", handleMove);
        const size = caculateSize(direction, e, { left, right, top, bottom });
        context.emit("update-position", { ...size, id: props.id });
        nextTick(() => {
          document.removeEventListener("mouseup", handleMouseUp);
        });
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    return { onItemClick, styles, editWrapper, startMove, startResize };
  },
});
</script>

<style scoped>
.edit-wrapper {
  padding: 0px;
  cursor: pointer;
  border: 1px solid transparent;
  user-select: none;
  box-sizing: content-box !important;
}
.edit-wrapper.hidden {
  display: none;
}

.edit-wrapper:hover {
  border: 1px dashed #ccc;
}
.edit-wrapper.actived {
  border: 1px solid #1890ff;
}
.edit-wrapper .slot-control /deep/ * {
  position: static !important;
  width: 100% !important;
  height: 100% !important;
}

.edit-wrapper .resizers {
  display: none;
  width: 100%;
  height: 100%;
}
.edit-wrapper.actived .resizers {
  display: block;
}
.edit-wrapper.actived .resizers .resizer {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #1890ff;
  position: absolute;
}
.edit-wrapper .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize;
}
.edit-wrapper .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.edit-wrapper .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
