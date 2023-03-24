<template>
  <div class="about">
    <h1>This is an template detail page</h1>
    <div id="canvas-source">
      {{ template.id }} - {{ template.title }} - {{ template.author }}
    </div>
    <a-button @click="goEditor">编辑</a-button>
    <Hello msg="hello" />
    <PickerColor @change="handlePickerChange" :value="pickColor" />
    <UploadTest />
    <hr />
    <UploadFile
      ref="uploadRef"
      :before-upload="handleBeforeUpload"
      :upload-progress="handleOnUploadProcess"
      :upload-success="handleOnUploadSuccess"
      :upload-error="handleOnUploadError"
      :auto-upload="false"
      list-type="picture"
      drag
    >
      <template #default>custom 点击上传</template>
      <template #loading>custom 上传中</template>
      <template #uploaded="{ uploadedData }">
        {{ uploadedData.url }}
      </template>
    </UploadFile>
    <hr />
    <h3>cropperjs 裁剪功能演示</h3>
    <CropperDemo></CropperDemo>
    <hr />
    <h3>MouseDemo 演示</h3>
    <MouseDemo></MouseDemo>
    <hr />
    <h3>html2canvas 基础原理</h3>
    <canvas id="canvas-image"></canvas>
    <a-button @click="drawCanvas">html2canvas 基础原理实现</a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import { GlobalDataProps } from "@/store";
import { TemplateProps } from "@/store/modules/templates";

import Hello from "@/components/Hello";
import PickerColor from "@/components/PickerColor.vue";
import UploadTest from "@/components/UploadTest.vue";
import UploadFile from "@/components/UploadFile.vue";
import CropperDemo from "./CropperDemo.vue";
import MouseDemo from "./MouseDemo.vue";

export default defineComponent({
  name: "TemplateDetailPage",
  setup() {
    const uploadRef = ref();
    const route = useRoute();
    const router = useRouter();
    const store = useStore<GlobalDataProps>();
    const currentId = route.params.id as string;
    const template = computed<TemplateProps>(() =>
      store.getters.getTemplateById(parseInt(currentId))
    );
    onMounted(async () => {
      if (currentId) {
        await store.dispatch("fetchTemplate", { id: currentId });
      }
    });

    const goEditor = () => {
      router.push(`/editor/${currentId}`);
    };

    const pickColor = ref<undefined | string>(undefined);
    const handlePickerChange = (color: string) => {
      pickColor.value = color;
    };

    const handleOnUploadProcess = (loaded: number, total: number) => {
      console.log("- handleOnUploadProcess", loaded, total);
    };

    const handleBeforeUpload = (file: File) => {
      console.log("handleBeforeUpload", file);
      return true;
    };

    const handleOnUploadSuccess = (result: any) => {
      console.log("handleOnUploadSuccess", result);
    };
    const handleOnUploadError = (e: Error) => {
      console.log("handleOnUploadError", e.message);
    };

    const drawCanvas = () => {
      const canvas = document.getElementById(
        "canvas-image"
      ) as HTMLCanvasElement;
      canvas.width = 200;
      canvas.height = 200;
      const element = document.getElementById("canvas-source") as HTMLElement;
      const data = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${element.innerHTML}
              </div>
          </foreignObject>
        </svg>
      `;
      const svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svg);
      const image = new Image();
      image.src = url;
      image.addEventListener("load", () => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0);
        }
      });
    };

    return {
      uploadRef,
      template,
      pickColor,
      handlePickerChange,
      goEditor,
      handleBeforeUpload,
      handleOnUploadProcess,
      handleOnUploadSuccess,
      handleOnUploadError,
      drawCanvas,
    };
  },
  components: {
    Hello,
    PickerColor,
    UploadTest,
    UploadFile,
    CropperDemo,
    MouseDemo,
  },
});
</script>
