<template>
  <div class="inline-edit" @click.stop="handleClick" ref="wrapperRef">
    <input
      v-model="innerValue"
      v-if="isEditing"
      placeholder="文本不能为空"
      ref="inputRef"
      :class="{ 'input-error': !validateCheck }"
      class="ant-input"
    />
    <slot v-else :text="innerValue">
      <span>{{ innerValue }}</span>
    </slot>
  </div>
</template>

<script lang="ts">
import useClickOutside from "@/hooks/useClickOutside";
import useKeyPress from "@/hooks/useKeyPress";
import { defineComponent, ref, computed, watch, nextTick } from "vue";
export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ["change"],
  setup(props, context) {
    const isEditing = ref(false);
    const innerValue = ref(props.value);
    let cachedOldValue = ""; //  存储旧值
    watch(
      () => props.value,
      (newValue) => {
        innerValue.value = newValue;
      }
    );
    const inputRef = ref<null | HTMLInputElement>(null);

    //  点击内联编辑, 修改为正在编辑
    const handleClick = () => {
      isEditing.value = true;
    };

    //  正在编辑阶段组件自动获得焦点处理
    watch(isEditing, async (newEditing) => {
      if (newEditing) {
        cachedOldValue = innerValue.value; //  编辑阶段 -> 保存旧值
        await nextTick();
        if (inputRef.value) {
          inputRef.value.focus();
        }
      }
    });

    //  鼠标离开组件时更新
    const wrapperRef = ref<null | HTMLElement>(null);
    const isOutside = useClickOutside(wrapperRef);
    const validateCheck = computed(() => innerValue.value.trim() !== "");
    watch(isOutside, (newValue) => {
      if (!validateCheck.value) return; //  没有输入直接 return
      //  鼠标离开当前节点并且处于正在编辑的状态时 -> 修改编辑状态 + 抛出变更值的事件
      if (newValue && isEditing.value) {
        isEditing.value = false;
        context.emit("change", innerValue.value);
      }
      isOutside.value = false;
    });

    //  监听 enter 键盘 -> 有值存储抛出修改事件
    useKeyPress("Enter", () => {
      if (!validateCheck.value) return;
      if (isEditing.value) {
        isEditing.value = false;
        context.emit("change", innerValue.value);
      }
    });

    //  监听 esc 键盘 -> 恢复原值
    useKeyPress("Escape", () => {
      if (isEditing.value) {
        isEditing.value = false;
        innerValue.value = cachedOldValue;
      }
    });
    return {
      isEditing,
      innerValue,
      validateCheck,
      wrapperRef,
      inputRef,
      handleClick,
    };
  },
});
</script>

<style>
.inline-edit {
  cursor: pointer;
}
.ant-input.input-error {
  border: 1px solid #f5222d;
}
.ant-input.input-error:focus {
  border-color: #f5222d;
}
.ant-input.input-error::placeholder {
  color: #f5222d;
}
</style>
