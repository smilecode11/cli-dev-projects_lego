<template>
  <div class="upload-file-component">
    <button @click="triggerUpload" :disabled="isUploading">
      <span v-if="isUploading">正在上传</span>
      <span v-else>点击上传</span>
    </button>
    <input
      @change="handleUpload"
      ref="inputFileRef"
      type="file"
      :style="{ display: 'none' }"
    />
    <ul class="upload-list">
      <li
        v-for="file in uploadFiles"
        :key="file.uid"
        :class="`upload-item upload-${file.status}`"
      >
        <span class="filename">{{ file.name }}</span>
        <span @click="handleDeleteItem(file.uid)" class="delete-icon">×</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";
type UploadStatus = "ready" | "loading" | "success" | "error";

export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  raw: File;
  status: UploadStatus;
}

export default defineComponent({
  props: {
    action: {
      type: String,
      default: "http://local.upload.test/7001",
    },
  },
  setup(props) {
    const uploadStatus = ref<UploadStatus>("ready");

    const inputFileRef = ref<null | HTMLInputElement>(null);
    // button 触发 input[type=file] 执行上传工作
    const triggerUpload = () => {
      if (inputFileRef.value) {
        inputFileRef.value.click();
      }
    };

    const uploadFiles = ref<UploadFile[]>([]);
    const isUploading = computed(() =>
      uploadFiles.value.some((file) => file.status === "loading")
    );

    const handleUpload = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files) {
        const uploadFile = files[0];

        const uploadObj = reactive<UploadFile>({
          uid: uuidV4(),
          name: uploadFile.name,
          size: uploadFile.size,
          raw: uploadFile,
          status: "loading",
        });
        uploadFiles.value.push(uploadObj);

        const formData = new FormData();
        formData.append(uploadFile.name, uploadFile);
        uploadStatus.value = "loading";
        axios
          .post(`${props.action}`, formData, {
            headers: {
              "Content-Type": "mutipart/form-data",
            },
          })
          .then((resp) => {
            console.log(resp.data);
            uploadObj.status = "success";
          })
          .catch((error) => {
            console.log(error.message);
            setTimeout(() => {
              uploadObj.status = "error";
            }, 700);
          })
          .finally(() => {
            //  重置 input value 值, 保证 input change 事件正常触发
            if (inputFileRef.value) {
              inputFileRef.value.value = "";
            }
          });
      }
    };

    const handleDeleteItem = (id: string) => {
      uploadFiles.value = uploadFiles.value.filter((file) => file.uid !== id);
    };

    return {
      uploadStatus,
      inputFileRef,
      triggerUpload,
      handleUpload,
      uploadFiles,
      isUploading,
      handleDeleteItem,
    };
  },
});
</script>

<style scoped>
.upload-success {
  color: aqua;
}
.upload-error {
  color: red;
}

.upload-loading {
  color: beige;
}
</style>
