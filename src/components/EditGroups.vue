<!-- 
  将组件属性进行分组展示
  通用属性时定死的, 需要手动添加关系
    [{
      text: '尺寸',
      items: ["height", "width", "paddingLeft", "paddingRight", "paddingTop",, "paddingBottom"]
    },
    ...
    ]
  业务组件 - 独特属性, 需要计算
  其实业务组件所有属性的数组(全集) - 通用数学的数组(子集) = 业务组件独有属性
  specialProps = Object.keys(props.props) - allNormalProps

  //  然后将 specialProps 得出的内容, 添加到数组第一项
  
  //  最终循环数组得出对应的界面
 -->
<template>
  <div class="edit-groups">
    <a-collapse v-model:activeKey="currentKey">
      <a-collapse-panel
        v-for="(item, index) in editGroups"
        :key="`item-${index}`"
        :header="item.text"
      >
        <props-table :props="item.props" @change="handleChange"></props-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue";
import { AllComponentProps } from "lego-bricks";
import { difference } from "lodash-es";

import PropsTable from "@/components/PropsTable.vue";

export interface GroupProps {
  text: string;
  items: string[];
}

const defaultEditGroups: GroupProps[] = [
  {
    text: "尺寸",
    items: [
      "height",
      "width",
      "paddingLeft",
      "paddingRight",
      "paddingTop",
      "paddingBottom",
    ],
  },
  {
    text: "边框",
    items: ["borderStyle", "borderColor", "borderWidth", "borderRadius"],
  },
  {
    text: "阴影与透明度",
    items: ["opacity", "boxShadow"],
  },
  {
    text: "位置",
    items: ["left", "top"],
  },
  {
    text: "事件功能",
    items: ["actionType", "url"],
  },
];

export default defineComponent({
  emits: ["change"],
  props: {
    props: {
      type: Object as PropType<AllComponentProps>,
      required: true,
    },
    groups: {
      type: Array as PropType<GroupProps[]>,
      default: defaultEditGroups,
    },
  },
  components: {
    PropsTable,
  },
  setup(props, context) {
    const currentKey = ref("item-0");
    const newGroups = computed(() => {
      // 1.合成 component 的特殊组件, 插入到 group 第一项
      const allNormalProps = props.groups.reduce((prev, current) => {
        return [...prev, ...current.items];
      }, [] as string[]);
      const specialProps = difference(Object.keys(props.props), allNormalProps);
      // console.log("_specialProps", specialProps);
      return [
        {
          text: "基础属性",
          items: specialProps,
        },
        ...props.groups,
      ];
    });
    console.log("_newGroups", newGroups);
    //  2.并根据实际值给每项赋值
    const editGroups = computed(() => {
      const result = newGroups.value.map((group) => {
        const propsMap = {} as AllComponentProps;
        group.items.forEach((prop) => {
          const key = prop as keyof AllComponentProps;
          propsMap[key] = props.props[key]; //  赋值
        });
        return {
          ...group,
          props: propsMap,
        };
      });
      return result;
    });
    // console.log("_editGroups", editGroups);

    const handleChange = (e: any) => {
      context.emit("change", e);
    };

    return {
      currentKey,
      editGroups,
      handleChange,
    };
  },
});
</script>
