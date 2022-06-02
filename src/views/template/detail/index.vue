<template>
  <div class="about">
    <h1>This is an template detail page</h1>
    <div>{{ template.id }} - {{ template.title }} - {{ template.author }}</div>
    <a-button @click="goEditor">编辑</a-button>
    <Hello msg="hello" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import { GlobalDataProps } from "@/store";
import { TemplateProps } from "@/store/modules/templates";

import Hello from "@/components/Hello";

export default defineComponent({
  name: "TemplateDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore<GlobalDataProps>();
    const currentId = route.params.id as string;
    const template = computed<TemplateProps>(() =>
      store.getters.getTemplateById(parseInt(currentId))
    );

    const goEditor = () => {
      router.push(`/editor/${currentId}`);
    };

    return {
      template,
      goEditor,
    };
  },
  components: {
    Hello,
  },
});
</script>
