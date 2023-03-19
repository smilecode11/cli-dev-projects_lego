<template>
  <a-spin v-if="globalLoading" tip="读取中" class="global-spinner" />
  <router-view />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { GlobalDataProps } from "@/store";
export default defineComponent({
  setup() {
    const router = useRoute();
    const store = useStore<GlobalDataProps>();
    const isLoading = computed(() => store.getters.isLoading);
    const globalLoading = computed(
      () => isLoading.value && !router.meta.disableLoading
    );
    return {
      globalLoading,
    };
  },
  components: {},
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.global-spinner {
  position: fixed;
  top: 100px;
  right: 50%;
  z-index: 9999;
}
</style>
