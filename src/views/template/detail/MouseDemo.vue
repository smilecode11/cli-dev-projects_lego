<template>
  <div class="mouse-container" id="canvas-area">
    <div class="mouse-wrap" ref="mouseElemRef" @mousedown="startMove"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick } from "vue";
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
      // console.log("_e", e.clientX, e.clientY);
      const left = e.clientX - gap.x - container.offsetLeft;
      const top = e.clientY - gap.y - container.offsetTop + window.scrollY;
      return {
        left,
        top,
      };
    };

    const startMove = (e: MouseEvent) => {
      const wrapper = mouseElemRef.value;
      if (wrapper) {
        const { left, top } = wrapper.getBoundingClientRect();
        gap.x = e.clientX - left;
        gap.y = e.clientY - top;
      }

      const handleMouseMove = (e: MouseEvent) => {
        const { left, top } = caculateMovePosition(e);
        // console.log("_handleMouseMove", left, top);
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
          // console.log("_handleMouseUp", left, top);
          isMoving = false;
        }
        nextTick(() => {
          document.removeEventListener("mouseup", handleMouseUp);
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
    return {
      mouseElemRef,
      startMove,
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
</style>
