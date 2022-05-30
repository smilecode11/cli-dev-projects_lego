<template>
  <div class="about">
    <h1>This is an template detail page</h1>
    <div>{{ template.id }} - {{ template.title }} - {{ template.author }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

import { GlobalDataProps } from "@/store";
import { TemplateProps } from "@/store/modules/templates";

export default defineComponent({
  name: "TemplateDetailPage",
  setup() {
    const route = useRoute();
    const store = useStore<GlobalDataProps>();
    const currentId = route.params.id as string;
    const template = computed<TemplateProps>(() =>
      store.getters.getTemplateById(parseInt(currentId))
    );

    return {
      template,
    };
  },
});
</script>
