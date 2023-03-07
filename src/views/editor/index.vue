<template>
  <div class="editor-page">
    <a-row class="container">
      <a-col :span="6" class="templates-wrap">
        <components-list
          :list="defaultTextTemplates"
          @onItemClick="handleItemClick"
          :components-list="components"
        ></components-list>
      </a-col>
      <a-col :span="12" class="editor-wrap">
        <div class="control">
          <!-- 动态渲染组件 -->
          <edit-wrapper
            v-for="component in components"
            :key="component.id"
            :id="component.id"
            :active="currentElement?.id === component.id"
            :currentElement="(currentElement as any)"
            @setActive="setActive"
          >
            <div v-if="!component.isHidden">
              <component
                :is="component.name"
                v-bind="component.props"
              ></component>
            </div>
          </edit-wrapper>
        </div>
      </a-col>
      <a-col :span="6" class="attrs-wrap">
        <!-- 属性渲染/编辑&图层设置 -->
        <a-tabs type="card" v-model:activeKey="activePanel">
          <a-tab-pane key="component" tab="属性设置">
            <div v-if="currentElement">
              <edit-groups
                v-if="!currentElement.isLocked"
                :props="currentElement.props"
                @change="handleChange"
              ></edit-groups>
              <!-- <props-table
                v-if="!currentElement.isLocked"
                :props="currentElement.props"
                @change="handleChange"
              ></props-table> -->
              <div v-else>
                <a-empty>
                  <template #description>
                    <p>该元素被锁定，无法编辑</p>
                  </template>
                </a-empty>
              </div>
              <pre>{{ currentElement?.props }}</pre>
            </div>
          </a-tab-pane>
          <a-tab-pane key="layer" tab="图层设置">
            <layer-list
              :list="components"
              :selectedId="((currentElement && currentElement.id) as string)"
              @change="handleChange"
              @select="setActive"
            ></layer-list>
          </a-tab-pane>
          <a-tab-pane key="page" tab="页面设置"></a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store/index";
import { ComponentProps } from "@/store/modules/editor";
import { defaultTextTemplates } from "@/defaultTemplates";

import LText from "@/components/LText.vue";
import LImage from "@/components/LImage.vue";
import ComponentsList from "@/components/ComponentsList.vue";
import EditWrapper from "@/components/EditWrapper.vue";
// import PropsTable from "@/components/PropsTable.vue";
import LayerList from "@/components/LayerList.vue";
import EditGroups from "@/components/EditGroups.vue";

export type TabType = "component" | "layer" | "page";

export default defineComponent({
  name: "EditorPage",
  setup() {
    const activePanel = ref<TabType>("component");
    const store = useStore<GlobalDataProps>();
    const components = computed(() => store.state.editor.components);

    const handleItemClick = (component: any) => {
      store.commit("editor/addComponent", component);
    };

    const setActive = (id: string) => {
      store.commit("editor/setActive", id);
    };

    //  当前选中
    const currentElement = computed<null | ComponentProps>(
      () => store.getters["editor/getCurrentElement"]
    );

    //  表单属性变更监听
    const handleChange = ({
      id,
      key,
      value,
      isRoot,
    }: {
      id: string;
      isRoot: boolean;
      key: string;
      value: any;
    }) => {
      console.log("_handleChange", key, value, id, isRoot);
      store.commit("editor/updateComponent", { key, value, id, isRoot });
    };

    return {
      components,
      defaultTextTemplates,
      handleItemClick,
      setActive,
      currentElement,
      handleChange,
      activePanel,
    };
  },
  components: {
    LText,
    LImage,
    ComponentsList,
    EditWrapper,
    // PropsTable,
    LayerList,
    EditGroups,
  },
});
</script>

<style scoped>
.editor-page {
  height: 100vh;
}

.container {
  height: 100%;
}

.container .templates-wrap {
  height: 100%;
  background: antiquewhite;
}

.templates-wrap .components-wrap {
  height: 100%;
}

.container .editor-wrap {
  padding: 120px 60px 0;
  background: plum;
}
.container .editor-wrap .control {
  min-height: 360px;
  background: aliceblue;
}
.container .attrs-wrap {
  background: aliceblue;
}
</style>
