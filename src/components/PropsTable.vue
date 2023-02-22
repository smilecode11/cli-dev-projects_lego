<template>
  <div class="props-table">
    <div v-for="(value, key) in finallyProps" :key="key" class="prop-item">
      <div class="label" v-if="value.text">{{ value.text }}</div>
      <component
        class="component-control"
        :is="value.component"
        :[value.valueProp]="value.value"
        v-bind="value.extraProps"
        v-on="value.events"
      >
        <template v-if="value.options">
          <component
            :is="value.subComponent"
            v-for="(option, k) in value.options"
            :key="k"
            :value="option.value"
          >
            <render-vnode :v-node="option.text"></render-vnode>
          </component>
        </template>
      </component>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, VNode } from "vue";
import { reduce } from "lodash-es";
import { AllComponentProps } from "@/defaultProps";
import { mapPropsToForms } from "@/propsMap";

import RenderVnode from "@/components/RenderVnode";
import PickerColor from "@/components/PickerColor.vue";
import ImageProcesser from "@/components/ImageProcesser.vue";

//  表单渲染的数据结构
interface FormProps {
  component: string;
  subComponent?: string;
  value: string;
  extraProps?: { [key: string]: any };
  text?: string;
  options?: { text: string | VNode; value: any }[];
  valueProp: string;
  eventName: string;
  events: { [key: string]: (e: any) => void };
}

export default defineComponent({
  props: {
    props: {
      type: Object as PropType<Partial<AllComponentProps>>,
      required: true,
    },
  },
  emits: ["change"],
  setup(props, context) {
    const finallyProps = computed(() => {
      return reduce(
        props.props,
        (result, value, key) => {
          const newKey = key as keyof AllComponentProps;
          const item = mapPropsToForms[newKey];
          if (item) {
            const {
              valueProp = "value",
              eventName = "change",
              initalTransform,
              afterTransform,
            } = item;

            const newItem: FormProps = {
              ...item,
              value: initalTransform ? initalTransform(value) : value,
              valueProp,
              eventName,
              events: {
                [eventName]: (e: any) => {
                  context.emit("change", {
                    key,
                    value: afterTransform ? afterTransform(e) : e,
                  });
                },
              },
            };

            result[newKey] = newItem;
          }
          return result;
        },
        {} as { [key: string]: FormProps }
      );
    });

    return { finallyProps };
  },
  components: {
    RenderVnode,
    PickerColor,
    ImageProcesser,
  },
});
</script>

<style scoped>
.props-table {
  padding: 12px 18px;
}
.prop-item {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.prop-item .label {
  flex: 0 0 60px;
}

.prop-item .component-control {
  flex: 1;
}
</style>
