<template>
  <div class="background-processer">
    <styled-upload v-if="!value" @success="onImageUploaded"></styled-upload>
    <image-processer
      v-else
      :value="value"
      @change="handleUploadUrl"
      :showDelete="true"
    ></image-processer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { message as AntdMessage } from "ant-design-vue";
import ImageProcesser from "@/components/ImageProcesser.vue";
import StyledUpload from "./StyledUpload.vue";
import { UploadResp } from "@/extraType";

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  components: {
    ImageProcesser,
    StyledUpload,
  },
  setup(props, context) {
    const onImageUploaded = (data: { resp: UploadResp; file: File }) => {
      const { resp } = data;
      if (resp.data.url) {
        AntdMessage.success("上传成功");
        context.emit("change", resp.data.url);
      }
    };
    const handleUploadUrl = (url: string) => {
      if (url) {
        context.emit("change", url);
      }
    };

    return {
      onImageUploaded,
      handleUploadUrl,
    };
  },
});
</script>
