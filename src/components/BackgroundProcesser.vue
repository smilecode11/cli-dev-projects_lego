<template>
  <div class="background-processer">
    <image-processer
      :value="value"
      @change="handleUploadUrl"
      :showDelete="true"
    ></image-processer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ImageProcesser from "@/components/ImageProcesser.vue";

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  components: {
    ImageProcesser,
  },
  setup(props, context) {
    const handleUploadUrl = (url: string) => {
      console.log("_handleUploadUrl", url);
      context.emit("change", url);
    };

    return {
      handleUploadUrl,
    };
  },
});
</script>
