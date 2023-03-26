<template>
  <div class="editor-page">
    <a-modal
      title="发布成功"
      v-model:visible="showPublishForm"
      width="700px"
      :footer="null"
    >
      <publish-form />
    </a-modal>
    <!-- 
       -->
    <preview-form
      v-if="showPreviewForm"
      v-model:visible="showPreviewForm"
    ></preview-form>
    <a-layout>
      <a-layout-header class="header">
        <div class="page-title">
          <router-link to="/">
            <img
              alt="慕课乐高"
              src="../../assets/logo-simple.png"
              class="logo-img"
            />
          </router-link>
          <inline-edit :value="page.title" @change="titleChange" />
        </div>
        <div class="page-opera">
          <a-button type="primary" @click="handlePreview">预览和设置</a-button>
          <a-button type="primary" :loading="saveWorkLoading" @click="saveWork"
            >保存</a-button
          >
          <a-button
            type="primary"
            @click="handlePublish"
            :loading="isPublishing"
            >发布</a-button
          >
          <user-profile :user="userInfo"></user-profile>
        </div>
      </a-layout-header>
    </a-layout>
    <a-row class="container">
      <a-col :span="6" class="templates-wrap">
        <components-list
          :list="defaultTextTemplates"
          @onItemClick="handleItemClick"
          :components-list="components"
        ></components-list>
      </a-col>
      <a-col :span="12" class="editor-wrap">
        <history-area></history-area>
        <div
          class="control"
          :class="{ 'canvas-fix': canvasFix }"
          id="canvas-area"
        >
          <div class="body-container" :style="page.props">
            <!-- 动态渲染组件 -->
            <edit-wrapper
              v-for="component in components"
              :key="component.id"
              :id="component.id"
              :active="currentElement?.id === component.id"
              :currentElement="(currentElement as any)"
              :props="component.props"
              :hidden="component.isHidden"
              @setActive="setActive"
              @update-position="updatePosition"
            >
              <div v-if="!component.isHidden">
                <component
                  :is="component.name"
                  v-bind="component.props"
                ></component>
              </div>
            </edit-wrapper>
          </div>
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
              <div v-else>
                <a-empty>
                  <template #description>
                    <p>该元素被锁定，无法编辑</p>
                  </template>
                </a-empty>
              </div>
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
          <a-tab-pane key="page" tab="页面设置">
            <props-table :props="page.props" @change="pageChange"></props-table>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { GlobalDataProps } from "@/store/index";
import { ComponentProps } from "@/store/modules/editor";
import defaultTextTemplates from "@/defaultTemplates";
import { pickBy } from "lodash-es";

import LText from "@/components/LText.vue";
import LImage from "@/components/LImage.vue";
import ComponentsList from "@/components/ComponentsList.vue";
import EditWrapper from "@/components/EditWrapper.vue";
import PropsTable from "@/components/PropsTable.vue";
import LayerList from "@/components/LayerList.vue";
import EditGroups from "@/components/EditGroups.vue";
import HistoryArea from "./HistoryArea.vue";
import initHotKeys from "@/plugins/hotKeys";
import initContextMenu from "@/plugins/contextMenu";
import InlineEdit from "@/components/InlineEdit.vue";
import UserProfile from "@/layout/header/UserProfile.vue";
import PublishForm from "./publishForm.vue";
import PreviewForm from "./PreviewForm.vue";
import useSaveWork from "@/hooks/useSaveWork";
import usePublishWork from "@/hooks/usePublishWork";
export type TabType = "component" | "layer" | "page";

export default defineComponent({
  name: "EditorPage",
  setup() {
    initHotKeys(); //  键盘插件
    initContextMenu(); //  右键菜单插件
    const route = useRoute();
    const currentWorkId = route.params.id;
    const store = useStore<GlobalDataProps>();
    const activePanel = ref<TabType>("component");
    const canvasFix = ref(false);
    const showPublishForm = ref(false);
    const showPreviewForm = ref(false);
    const components = computed(() => store.state.editor.components);
    const userInfo = computed(() => store.state.user);
    const { saveWork, saveWorkLoading } = useSaveWork();
    const { publishWork, isPublishing } = usePublishWork();

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
      // console.log("_handleChange", key, value, id, isRoot);
      store.commit("editor/updateComponent", { key, value, id, isRoot });
    };

    const page = computed(() => store.state.editor.page);
    const pageChange = (e: any) => {
      store.commit("editor/updatePage", e);
    };

    const updatePosition = (data: {
      left: number;
      top: number;
      id: string;
    }) => {
      const { id } = data;
      const positionData = pickBy(data, (v, k) => k !== "id");
      // console.log("_positionData", positionData);
      const keysArr = Object.keys(positionData);
      const valuesArr = Object.values(positionData).map((v) => `${v}px`);
      store.commit("editor/updateComponent", {
        key: keysArr,
        value: valuesArr,
        id,
      });
    };

    const titleChange = (title: string) => {
      store.commit("editor/updatePage", {
        key: "title",
        value: title,
        isRoot: true,
      });
    };

    onMounted(() => {
      store.dispatch("editor/fetchWork", { id: currentWorkId });
    });

    const handlePublish = async () => {
      setActive(""); // 重置选中, 修复canvas选中框
      const el = document.getElementById("canvas-area") as HTMLElement;
      canvasFix.value = true; //  修复 html2canvas 针对 box-shadow 和 max-height 的bug
      await nextTick();
      try {
        await publishWork(el); // 作品发布
        showPublishForm.value = true;
      } catch (error) {
        console.error(error);
      } finally {
        canvasFix.value = false;
      }
    };

    const handlePreview = async () => {
      showPreviewForm.value = true;
    };

    return {
      components,
      defaultTextTemplates,
      handleItemClick,
      setActive,
      currentElement,
      handleChange,
      activePanel,
      page,
      pageChange,
      updatePosition,
      userInfo,
      titleChange,
      saveWork,
      saveWorkLoading,
      handlePublish,
      canvasFix,
      isPublishing,
      showPublishForm,
      showPreviewForm,
      handlePreview,
    };
  },
  components: {
    LText,
    LImage,
    ComponentsList,
    EditWrapper,
    PropsTable,
    LayerList,
    EditGroups,
    HistoryArea,
    InlineEdit,
    UserProfile,
    PublishForm,
    PreviewForm,
  },
});
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
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
  padding: 0;
  margin: 0;
  min-width: 375px;
  min-height: 200px;
  border: 1px solid #efefef;
  background: #fff;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  margin-top: 50px;
  max-height: 80vh;
}
.control.canvas-fix {
  position: absolute !important;
  max-height: none !important;
}

.control.canvas-fix /deep/ .slot-control * {
  box-shadow: none !important;
}

.container .attrs-wrap {
  background: aliceblue;
}

.header {
  display: flex;
}
.page-title {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.page-title .inline-edit {
  margin-left: 10px;
  color: #fff;
}
.page-title .inline-edit span {
  font-weight: 500;
  font-size: 16px;
}

.page-opera {
  display: flex;
  align-items: center;
}
.page-opera > * {
  margin-right: 24px;
}
</style>
