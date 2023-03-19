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
      <h1 v-if="isLoading">templates is Loading!</h1>
      <TemplateList :list="testData" />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store/index";
import TemplateList from "@/components/TemplateList.vue";
import { message as antdMessage } from "ant-design-vue";

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
    onMounted(() => {
      //  获取模板列表
      store.dispatch("fetchTemplates");

      // 登录状态持久化
      // if (!store.state.user.isLogin && localStorage.getItem("token")) {
      //   store.dispatch("fetchCurrentUser").catch(() => {
      //     antdMessage.error("登录验证失败, 请重新登录");
      //     localStorage.removeItem("token"); //  清除 token
      //   });
      // }
    });
    return { testData, searchParams, onSearchTemplates, isLoading };
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
