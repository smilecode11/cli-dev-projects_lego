<template>
  <div class="home-container">
    <!-- 搜索栏 -->
    <section>
      <a-input-search
        v-model:value="searchParams.keyword"
        placeholder="检索模板"
        enter-button
        style="width: 260px"
        @search="onSearchTemplates"
      ></a-input-search>
    </section>

    <!-- 模板列表 -->
    <section>
      <a-row>
        <a-col>
          <TemplateList :list="testData" />
        </a-col>
        <a-col>
          <a-button type="primary" v-if="!isLastPage" @click="loadMorePage">
            加载更多
          </a-button>
        </a-col>
      </a-row>
      <a-row> </a-row>
    </section>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, reactive, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store/index";

import TemplateList from "@/components/TemplateList.vue";
import { message as antdMessage } from "ant-design-vue";
import userLoadMore from "@/hooks/useLoadMore";

interface ParamsProps {
  keyword?: string;
}

export default defineComponent({
  name: "HomePage",
  setup() {
    //  检索关键词搜素模板
    const searchParams = reactive<ParamsProps>({});
    const onSearchTemplates = () => {
      console.log(`search templates with keyword ${searchParams.keyword}`);
    };

    const store = useStore<GlobalDataProps>();
    const isLoading = computed(() =>
      store.getters.isOpLoading("fetchTemplates")
    );
    const error = computed(() => store.state.global.error);
    watch(
      () => error.value.status,
      (errorValue) => {
        if (errorValue) {
          antdMessage.error(error.value.message || "未知错误");
        }
      }
    );
    const testData = computed(() => store.state.templates.data);
    const total = computed(() => store.state.templates.totalTemplates);
    const { loadMorePage, isLastPage } = userLoadMore("fetchTemplates", total, {
      pageIndex: 0,
      pageSize: 4,
    });
    onMounted(() => {
      //  获取模板列表
      store.dispatch("fetchTemplates", {
        searchParams: { pageIndex: 0, pageSize: 4 },
      });

      // 使用 loadMorePage 非常容易就实现了一个下拉加载
      window.addEventListener("scroll", (e) => {
        const totalPageHeight = document.body.scrollHeight;
        const scrollPoint = window.scrollY + window.innerHeight;
        if (scrollPoint >= totalPageHeight && !isLastPage.value) {
          console.log("at the bottom");
          loadMorePage();
        }
      });
    });
    return {
      testData,
      searchParams,
      onSearchTemplates,
      isLoading,
      loadMorePage,
      isLastPage,
    };
  },
  components: {
    TemplateList,
  },
});
</script>

<style scoped>
.home-container {
  padding: 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

section {
  margin-top: 16px;
  max-width: 1320px;
  min-width: 960px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
</style>
