<template>
  <div
    @click="setActive(id)"
    class="edit-wrapper"
    :class="{ active: activeClass }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { ComponentProps } from "@/store/modules/editor";
import { defineComponent, PropType, computed } from "vue";
export default defineComponent({
  emits: ["set-active"],
  props: {
    id: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    currentElement: {
      type: Object as PropType<ComponentProps>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const activeClass = computed(
      () =>
        props.active && !(props.currentElement && props.currentElement).isHidden
    );
    const setActive = (id: string) => {
      emit("set-active", id);
    };
    return { setActive, activeClass };
  },
});
</script>

<style scoped>
.edit-wrapper.active {
  border: 1px solid #1890ff;
}
</style>
