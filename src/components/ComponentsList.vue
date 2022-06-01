<template>
  <div
    v-for="(item, index) in list"
    :key="index"
    @click="onItemClick(item)"
    class="component-item"
  >
    <l-text v-bind="item"></l-text>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import LText from "@/components/LText.vue";
import { TextComponentProps } from "@/defaultProps";

export default defineComponent({
  props: {
    list: Array as PropType<Partial<TextComponentProps>[]>,
    default: () => [],
  },
  emits: ["on-item-click"],
  setup(props, { emit }) {
    const onItemClick = (props: Partial<TextComponentProps>) => {
      emit("on-item-click", props);
    };
    return { onItemClick };
  },
  components: {
    LText,
  },
});
</script>
