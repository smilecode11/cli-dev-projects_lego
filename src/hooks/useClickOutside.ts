import { onMounted, onUnmounted, ref, Ref } from "vue";

/** 判断触发事件是否脱离自身节点*/
const useClickOutside = (elementRef: Ref<null | HTMLElement>) => {
  const isClickOutside = ref(false);
  const handler = (e: MouseEvent) => {
    if (elementRef.value && e.target) {
      // el.contains 返回是节点的包含后代,则返回 true, 否则返回 false
      if (elementRef.value.contains(e.target as HTMLElement)) {
        isClickOutside.value = false;
      } else {
        isClickOutside.value = true;
      }
    }
  };

  onMounted(() => {
    document.addEventListener("click", handler);
  });
  onUnmounted(() => {
    document.removeEventListener("click", handler);
  });
  return isClickOutside;
};

export default useClickOutside;
