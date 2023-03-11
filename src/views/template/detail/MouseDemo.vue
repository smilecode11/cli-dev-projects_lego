<template>
  <div class="mouse-container" id="canvas-area">
    <div class="mouse-wrap active" ref="mouseElemRef" @mousedown="startMove">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from "vue";

type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface OriginalPositions {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export default defineComponent({
  emits: ["update-position"],
  setup(props, context) {
    const mouseElemRef = ref<null | HTMLElement>(null);
    let isMoving = false;
    // 偏移量
    const gap = {
      x: 0,
      y: 0,
    };
    const caculateMovePosition = (e: MouseEvent) => {
      const container = document.getElementById("canvas-area") as HTMLElement;
      const left = e.clientX - gap.x - container.offsetLeft;
      const top = e.clientY - gap.y - container.offsetTop + window.scrollY;
      return {
        left,
        top,
      };
    };
    //  鼠标拖动变更元素位置
    const startMove = (e: MouseEvent) => {
      const wrapper = mouseElemRef.value;
      if (wrapper) {
        const { left, top } = wrapper.getBoundingClientRect();
        gap.x = e.clientX - left;
        gap.y = e.clientY - top;
      }

      const handleMouseMove = (e: MouseEvent) => {
        const { left, top } = caculateMovePosition(e);
        isMoving = true;
        if (wrapper) {
          wrapper.style.left = left + "px";
          wrapper.style.top = top + "px";
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", handleMouseMove);
        if (isMoving) {
          const { left, top } = caculateMovePosition(e);
          context.emit("update-position", { left, top });
          isMoving = false;
        }
        nextTick(() => {
          document.removeEventListener("mouseup", handleMouseUp);
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

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
      const topOffset = clientY - container.offsetTop + window.scrollY;
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
        case "bottom-left":
          return {
            width: leftWidth,
            height: bottomHeight,
            left: leftOffset,
          };
        case "bottom-right":
          return {
            width: rightWidth,
            height: bottomHeight,
          };
        default:
          break;
      }
    };
    //  鼠标拖动变更元素大小
    const startResize = (direction: ResizeDirection) => {
      const currentElement = mouseElemRef.value as HTMLElement;
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
        context.emit("update-position", { ...size });
        nextTick(() => {
          document.removeEventListener("mouseup", handleMouseUp);
        });
      };
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    return {
      mouseElemRef,
      startMove,
      startResize,
    };
  },
});
</script>

<style>
.mouse-container {
  width: 100%;
  min-height: 320px;
  position: relative;
}
.mouse-wrap {
  position: absolute;
  width: 100px;
  height: 100px;
  background: goldenrod;
}

.mouse-wrap .resizers {
  display: none;
  width: 100%;
  height: 100%;
}
.mouse-wrap.active .resizers {
  display: block;
  border: 1px solid #1890ff;
  user-select: none;
  z-index: 1500;
}
.mouse-wrap.active .resizers .resizer {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #1890ff;
  position: absolute;
}
.mouse-wrap .resizers .resizer.top-left {
  left: -5px;
  top: -5px;
  cursor: nwse-resize;
}
.mouse-wrap .resizers .resizer.top-right {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.mouse-wrap .resizers .resizer.bottom-left {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.mouse-wrap .resizers .resizer.bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
