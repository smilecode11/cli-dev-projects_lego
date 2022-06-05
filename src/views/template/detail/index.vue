<template>
  <div class="about">
    <h1>This is an template detail page</h1>
    <div>{{ template.id }} - {{ template.title }} - {{ template.author }}</div>
    <a-button @click="goEditor">编辑</a-button>
    <Hello msg="hello" />
    <PickerColor @change="handlePickerChange" :value="pickColor" />
    <UploadTest />
    <hr />
    <UploadFileVue />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import { GlobalDataProps } from "@/store";
import { TemplateProps } from "@/store/modules/templates";

import Hello from "@/components/Hello";
import PickerColor from "@/components/PickerColor.vue";
import UploadTest from "@/components/UploadTest.vue";
import UploadFileVue from "@/components/UploadFile.vue";

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

    const pickColor = ref<undefined | string>(undefined);
    const handlePickerChange = (color: string) => {
      pickColor.value = color;
    };

    return {
      template,
      pickColor,
      handlePickerChange,
      goEditor,
    };
  },
  components: {
    Hello,
    PickerColor,
    UploadTest,
    UploadFileVue,
  },
});
</script>
