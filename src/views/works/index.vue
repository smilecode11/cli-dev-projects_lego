<template>
  <div class="mywork-container content-container">
    <a-row
      type="flex"
      justify="space-between"
      align="middle"
      class="poster-title"
    >
      <h2>我的作品和模版</h2>
    </a-row>
    <a-tabs @change="changeCategory">
      <a-tab-pane key="0" tab="我的作品"> </a-tab-pane>
      <a-tab-pane key="1" tab="我的模版"> </a-tab-pane>
    </a-tabs>
    <a-empty v-if="works.length === 0 && !isLoading">
      <template v-slot:description>
        <span> 还没有任何作品 </span>
      </template>
      <a-button type="primary" size="large"> 创建你的第一个设计 🎉 </a-button>
    </a-empty>
    <works-list
      :list="works"
      @on-delete="onDelete"
      @on-copy="onCopy"
      :loading="isLoading"
    >
    </works-list>
    <a-row type="flex" justify="space-between" align="middle">
      <ul class="ant-pagination">
        <li
          class="ant-pagination-prev"
          :class="{ 'ant-pagination-disabled': isFirstPage }"
        >
          <a class="ant-pagination-item-link" @click.prevent="loadPrevPage">
            上一页
          </a>
        </li>
        <li
          v-for="item in totalPage"
          :key="item"
          class="ant-pagination-item"
          :class="{ 'ant-pagination-item-active': pageIndex + 1 === item }"
        >
          <a @click.prevent="goToPage(item - 1)">{{ item }}</a>
        </li>
        <li
          class="ant-pagination-next"
          :class="{ 'ant-pagination-disabled': isLastPage }"
        >
          <a class="ant-pagination-item-link" @click.prevent="loadMorePage">
            下一页
          </a>
        </li>
      </ul>
      <h2>{{ pageIndex }}</h2>
      <a-button
        type="primary"
        size="large"
        @click="loadPrevPage"
        v-if="!isFirstPage"
        :loading="isLoading"
        >上一页</a-button
      >
      <a-button
        type="primary"
        size="large"
        @click="loadMorePage"
        v-if="!isLastPage"
        :loading="isLoading"
        >下一页</a-button
      >
    </a-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, nextTick } from "vue";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store";
import useLoadMore from "@/hooks/useLoadMore";

import WorksList from "@/components/WorksList.vue";
export default defineComponent({
  name: "WorksPage",
  setup() {
    const store = useStore<GlobalDataProps>();
    const isLoading = computed(() => store.getters.isOpLoading("fetchWorks"));
    const works = computed(() => store.state.templates.works);
    const total = computed(() => store.state.templates.totalWorks);
    const isTemplate = ref(0);
    const searchParams = computed(() => ({
      pageIndex: 0,
      pageSize: 4,
      isTemplate: isTemplate.value,
    }));
    const {
      isLastPage,
      loadMorePage,
      isFirstPage,
      loadPrevPage,
      pageIndex,
      requestParams,
      goToPage,
      totalPage,
    } = useLoadMore("fetchWorks", total, searchParams.value);

    /** 切换选项卡*/
    const changeCategory = (key: any) => {
      isTemplate.value = key;
      pageIndex.value = 0; //  重置当前页面
      searchParams.value.isTemplate = key;
      nextTick(() => {
        store.dispatch("fetchWorks", { searchParams: searchParams.value });
      });
    };

    const onDelete = () => {
      console.log("_onDelete");
    };

    const onCopy = () => {
      console.log("_onCopy");
    };

    onMounted(() => {
      store.dispatch("fetchWorks", { searchParams: searchParams.value });
    });

    return {
      isLoading,
      works,
      changeCategory,
      onDelete,
      onCopy,
      isLastPage,
      loadMorePage,
      isFirstPage,
      loadPrevPage,
      pageIndex,
      requestParams,
      goToPage,
      totalPage,
    };
  },
  components: {
    WorksList,
  },
});
</script>

<style scoped>
.mywork-container .ant-input-search {
  width: 30%;
}
.searchResult {
  display: flex;
  align-items: center;
}
#main-chart {
  position: relative;
}
.chart-loading {
  position: absolute;
  left: 50%;
  top: 50%;
}
</style>
